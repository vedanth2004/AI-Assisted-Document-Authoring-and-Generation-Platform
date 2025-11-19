from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

from database import get_db, User, Project, DocumentSection
from auth import get_current_user

router = APIRouter()

class SectionResponse(BaseModel):
    id: int
    section_index: int
    title: str
    content: str
    generated_at: Optional[datetime] = None
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

@router.get("/{project_id}/sections", response_model=List[SectionResponse])
async def get_project_sections(
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
    
    sections = sorted(project.sections, key=lambda x: x.section_index)
    return sections

