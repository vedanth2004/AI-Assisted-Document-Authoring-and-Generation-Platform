from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from docx import Document
from pptx import Presentation
from io import BytesIO
import os
from datetime import datetime

from database import get_db, User, Project, DocumentSection
from auth import get_current_user

router = APIRouter()

@router.get("/{project_id}/download")
async def export_document(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    sections = sorted(
        db.query(DocumentSection).filter(DocumentSection.project_id == project.id).all(),
        key=lambda x: x.section_index
    )
    
    if not sections:
        raise HTTPException(status_code=400, detail="No content to export")
    
    # Create temp directory if it doesn't exist
    temp_dir = "temp_exports"
    os.makedirs(temp_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{project.title.replace(' ', '_')}_{timestamp}"
    
    if project.document_type == "docx":
        doc = Document()
        doc.add_heading(project.topic, 0)
        
        for section in sections:
            doc.add_heading(section.title, level=1)
            if section.content:
                # Split content into paragraphs
                paragraphs = section.content.split('\n')
                for para in paragraphs:
                    para = para.strip()
                    if para:
                        doc.add_paragraph(para)
            doc.add_paragraph("")  # Add spacing between sections
        
        filepath = os.path.join(temp_dir, f"{filename}.docx")
        doc.save(filepath)
        
        return FileResponse(
            filepath,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"{filename}.docx"
        )
    
    else:  # pptx
        prs = Presentation()
        
        # Title slide
        title_slide_layout = prs.slide_layouts[0]
        slide = prs.slides.add_slide(title_slide_layout)
        title = slide.shapes.title
        subtitle = slide.placeholders[1]
        
        title.text = project.topic
        subtitle.text = f"Generated on {datetime.now().strftime('%B %d, %Y')}"
        
        # Content slides
        content_layout = prs.slide_layouts[1]  # Title and Content layout
        
        for section in sections:
            slide = prs.slides.add_slide(content_layout)
            title_shape = slide.shapes.title
            content_shape = slide.placeholders[1]
            
            title_shape.text = section.title
            
            if section.content:
                text_frame = content_shape.text_frame
                text_frame.word_wrap = True
                
                # Split content into bullet points or paragraphs
                lines = section.content.split('\n')
                first_line = True
                
                for line in lines:
                    line = line.strip()
                    if line:
                        if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                            line = line.lstrip('•-* ').strip()
                        
                        if first_line:
                            p = text_frame.paragraphs[0]
                            p.text = line
                            first_line = False
                        else:
                            p = text_frame.add_paragraph()
                            p.text = line
                            p.level = 0
        
        filepath = os.path.join(temp_dir, f"{filename}.pptx")
        prs.save(filepath)
        
        return FileResponse(
            filepath,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            filename=f"{filename}.pptx"
        )

