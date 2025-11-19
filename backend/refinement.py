import google.generativeai as genai
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db, User, Project, DocumentSection, Refinement
from auth import get_current_user
from generation import generate_content_with_gemini

router = APIRouter()

def get_gemini_api_key():
    """Get Gemini API key from environment"""
    from dotenv import load_dotenv
    load_dotenv()
    
    key = os.getenv("GEMINI_API_KEY")
    # Remove quotes if present
    if key:
        key = key.strip().strip("'").strip('"')
    return key if key else None

class RefinementRequest(BaseModel):
    project_id: int
    section_id: int
    refinement_prompt: str

class FeedbackRequest(BaseModel):
    project_id: int
    section_id: int
    feedback: str  # "like" or "dislike"
    comment: Optional[str] = None

class RefinementResponse(BaseModel):
    id: int
    refined_content: str
    refinement_prompt: Optional[str]
    created_at: datetime

@router.post("/refine")
async def refine_section(
    request: RefinementRequest,
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
    
    section = db.query(DocumentSection).filter(
        DocumentSection.id == request.section_id,
        DocumentSection.project_id == project.id
    ).first()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    if not section.content:
        raise HTTPException(status_code=400, detail="Section has no content to refine")
    
    try:
        # Generate refined content
        refined_content = generate_content_with_gemini(
            project.topic,
            section.title,
            project.document_type,
            f"{section.content}\n\nUser refinement request: {request.refinement_prompt}"
        )
        
        # Update section content
        section.content = refined_content
        section.updated_at = datetime.utcnow()
        
        # Create refinement record
        refinement = Refinement(
            project_id=project.id,
            section_id=section.id,
            refinement_prompt=request.refinement_prompt,
            refined_content=refined_content
        )
        db.add(refinement)
        db.commit()
        db.refresh(refinement)
        
        return {
            "id": refinement.id,
            "refined_content": refined_content,
            "refinement_prompt": request.refinement_prompt,
            "created_at": refinement.created_at
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refining content: {str(e)}")

@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if request.feedback not in ["like", "dislike"]:
        raise HTTPException(status_code=400, detail="Feedback must be 'like' or 'dislike'")
    
    project = db.query(Project).filter(
        Project.id == request.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    section = db.query(DocumentSection).filter(
        DocumentSection.id == request.section_id,
        DocumentSection.project_id == project.id
    ).first()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Create feedback record
    refinement = Refinement(
        project_id=project.id,
        section_id=section.id,
        feedback=request.feedback,
        comment=request.comment,
        refined_content=section.content or ""
    )
    db.add(refinement)
    db.commit()
    
    return {"message": "Feedback submitted successfully"}

@router.get("/{project_id}/history")
async def get_refinement_history(
    project_id: int,
    section_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    query = db.query(Refinement).filter(Refinement.project_id == project.id)
    if section_id:
        query = query.filter(Refinement.section_id == section_id)
    
    refinements = query.order_by(Refinement.created_at.desc()).all()
    
    return [
        {
            "id": r.id,
            "section_id": r.section_id,
            "refinement_prompt": r.refinement_prompt,
            "feedback": r.feedback,
            "comment": r.comment,
            "created_at": r.created_at
        }
        for r in refinements
    ]

