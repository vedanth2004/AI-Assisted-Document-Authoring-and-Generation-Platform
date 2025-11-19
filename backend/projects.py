from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db, User, Project, DocumentStructure, DocumentSection
from auth import get_current_user

router = APIRouter()

class ProjectCreate(BaseModel):
    title: str
    document_type: str  # "docx" or "pptx"
    topic: str

class ProjectStructureCreate(BaseModel):
    structure_data: List[str]  # Section headers for docx, slide titles for pptx

class ProjectResponse(BaseModel):
    id: int
    title: str
    document_type: str
    topic: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectResponse):
    structure: Optional[dict] = None
    sections: List[dict] = []

@router.post("", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_project = Project(
        title=project_data.title,
        document_type=project_data.document_type,
        topic=project_data.topic,
        user_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return db_project

@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    return projects

@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    structure = None
    if project.structure:
        structure = {"structure_data": project.structure.structure_data}
    
    sections = [
        {
            "id": s.id,
            "section_index": s.section_index,
            "title": s.title,
            "content": s.content,
            "generated_at": s.generated_at,
            "updated_at": s.updated_at
        }
        for s in sorted(project.sections, key=lambda x: x.section_index)
    ]
    
    return {
        **project.__dict__,
        "structure": structure,
        "sections": sections
    }

@router.post("/{project_id}/structure")
async def save_project_structure(
    project_id: int,
    structure_data: ProjectStructureCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Update or create structure
    if project.structure:
        project.structure.structure_data = structure_data.structure_data
        project.structure.updated_at = datetime.utcnow()
    else:
        db_structure = DocumentStructure(
            project_id=project.id,
            structure_data=structure_data.structure_data
        )
        db.add(db_structure)
    
    db.commit()
    
    return {"message": "Structure saved successfully"}

@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(project)
    db.commit()
    
    return {"message": "Project deleted successfully"}

