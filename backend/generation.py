import google.generativeai as genai
import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db, User, Project, DocumentStructure, DocumentSection
from auth import get_current_user

router = APIRouter()

# Initialize Gemini API - load from environment
# Note: load_dotenv() is called in main.py before this module is imported
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_gemini_api_key():
    """Get Gemini API key, loading from .env if needed"""
    # Reload .env to ensure we have the latest values
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(dotenv_path=env_path, override=True)
    
    key = os.getenv("GEMINI_API_KEY")
    # Remove quotes if present (python-dotenv should handle this, but just in case)
    if key:
        key = key.strip().strip("'").strip('"')
        if key:
            genai.configure(api_key=key)
    return key if key else None

class GenerateRequest(BaseModel):
    project_id: int
    section_indices: Optional[List[int]] = None  # If None, generate all

class GenerationResponse(BaseModel):
    message: str
    sections_generated: List[int]

def generate_content_with_gemini(topic: str, section_title: str, document_type: str, existing_content: str = None) -> str:
    """Generate content using Gemini API"""
    try:
        # Ensure API key is configured
        api_key = get_gemini_api_key()
        if not api_key:
            raise Exception("Gemini API key not configured")
        
        # Try gemini-2.5-flash, fallback to gemini-1.5-flash if not available
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception:
            # Fallback to a known working model
            model = genai.GenerativeModel('gemini-1.5-flash')
        
        if existing_content:
            prompt = f"""Given the topic: "{topic}"

Section/Slide Title: "{section_title}"

Existing content:
{existing_content}

Please refine or expand this content while maintaining relevance to the section title and overall topic.
"""
        else:
            if document_type == "docx":
                prompt = f"""Write a detailed section for a document with the topic: "{topic}"

Section Title: "{section_title}"

Write comprehensive content (approximately 300-500 words) for this section. The content should be well-structured, informative, and relevant to the overall topic."""
            else:  # pptx
                prompt = f"""Create content for a PowerPoint slide with the topic: "{topic}"

Slide Title: "{section_title}"

Write concise, presentation-ready content for this slide (approximately 100-200 words). Format it with bullet points where appropriate. Keep it clear and engaging for a presentation."""
        
        print(f"Calling Gemini API with prompt length: {len(prompt)}")
        response = model.generate_content(prompt)
        print(f"Received response from Gemini, length: {len(response.text) if response.text else 0}")
        
        if not response.text:
            raise Exception("Empty response from Gemini API")
        
        return response.text
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise Exception(f"Error generating content with Gemini: {str(e)}")

@router.post("/generate-section")
async def generate_single_section(
    project_id: int = Query(..., description="Project ID"),
    section_index: int = Query(..., description="Section index"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate content for a single section"""
    api_key = get_gemini_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.")
    
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.structure:
        raise HTTPException(status_code=400, detail="Project structure not defined")
    
    structure_data = project.structure.structure_data
    
    if section_index >= len(structure_data):
        raise HTTPException(status_code=400, detail=f"Section index {section_index} out of range")
    
    section_title = structure_data[section_index]
    
    # Check if section already exists
    existing_section = db.query(DocumentSection).filter(
        DocumentSection.project_id == project.id,
        DocumentSection.section_index == section_index
    ).first()
    
    try:
        print(f"Generating content for section {section_index}: {section_title}")
        content = generate_content_with_gemini(
            project.topic,
            section_title,
            project.document_type
        )
        print(f"Successfully generated content for section {section_index}, length: {len(content) if content else 0}")
        
        if not content:
            raise HTTPException(status_code=500, detail="Empty response from AI")
        
        if existing_section:
            existing_section.content = content
            existing_section.updated_at = datetime.utcnow()
            if not existing_section.generated_at:
                existing_section.generated_at = datetime.utcnow()
            section_id = existing_section.id
        else:
            db_section = DocumentSection(
                project_id=project.id,
                section_index=section_index,
                title=section_title,
                content=content,
                generated_at=datetime.utcnow()
            )
            db.add(db_section)
            db.flush()
            section_id = db_section.id
        
        db.commit()
        
        return {
            "success": True,
            "section_id": section_id,
            "section_index": section_index,
            "content": content
        }
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"Error generating section {section_index}: {error_msg}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating section: {error_msg}")

@router.post("/generate")
async def generate_content(
    request: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    api_key = get_gemini_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.")
    
    project = db.query(Project).filter(
        Project.id == request.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.structure:
        raise HTTPException(status_code=400, detail="Project structure not defined")
    
    structure_data = project.structure.structure_data
    sections_to_generate = request.section_indices if request.section_indices else list(range(len(structure_data)))
    
    generated_indices = []
    
    for idx in sections_to_generate:
        if idx >= len(structure_data):
            continue
        
        section_title = structure_data[idx]
        
        # Check if section already exists
        existing_section = db.query(DocumentSection).filter(
            DocumentSection.project_id == project.id,
            DocumentSection.section_index == idx
        ).first()
        
        try:
            print(f"Generating content for section {idx}: {section_title}")
            content = generate_content_with_gemini(
                project.topic,
                section_title,
                project.document_type
            )
            print(f"Successfully generated content for section {idx}, length: {len(content) if content else 0}")
            
            if not content:
                print(f"Warning: Empty content returned for section {idx}")
                continue
            
            if existing_section:
                existing_section.content = content
                existing_section.updated_at = datetime.utcnow()
                if not existing_section.generated_at:
                    existing_section.generated_at = datetime.utcnow()
            else:
                db_section = DocumentSection(
                    project_id=project.id,
                    section_index=idx,
                    title=section_title,
                    content=content,
                    generated_at=datetime.utcnow()
                )
                db.add(db_section)
            
            generated_indices.append(idx)
        except Exception as e:
            # Log the full error
            import traceback
            print(f"Error generating section {idx}: {str(e)}")
            print(traceback.format_exc())
            continue
    
    db.commit()
    
    return {
        "message": f"Generated {len(generated_indices)} sections",
        "sections_generated": generated_indices
    }

@router.post("/generate-template")
async def generate_ai_template(
    project_id: int = Query(..., description="Project ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bonus feature: Generate AI-suggested outline/slide titles"""
    api_key = get_gemini_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.")
    
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        # Ensure API key is configured
        api_key = get_gemini_api_key()
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.")
        
        # Try gemini-2.5-flash, fallback to gemini-1.5-flash if not available
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception:
            # Fallback to a known working model
            model = genai.GenerativeModel('gemini-1.5-flash')
        
        if project.document_type == "docx":
            prompt = f"""Given the topic: "{project.topic}"

Generate a comprehensive document outline with 5-8 section headers. Return only the section titles, one per line, without numbering or bullets."""
        else:  # pptx
            prompt = f"""Given the topic: "{project.topic}"

Generate a PowerPoint presentation outline with 8-12 slide titles. Return only the slide titles, one per line, without numbering or bullets."""
        
        response = model.generate_content(prompt)
        titles = [line.strip() for line in response.text.strip().split('\n') if line.strip()]
        
        # Filter out any extra text that might have been generated
        titles = [t for t in titles if not t.startswith('#') and len(t) > 3]
        
        return {"structure_data": titles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating template: {str(e)}")

