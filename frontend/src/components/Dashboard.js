import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import Navbar from './layout/Navbar';
import Badge from './ui/Badge';
import ProgressBar from './ui/ProgressBar';
import LoadingSpinner from './ui/LoadingSpinner';
import Modal from './ui/Modal';
import './Dashboard.css';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  const { user, loading: authLoading } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/api/projects');
      const projectsWithStatus = await Promise.all(
        response.data.map(async (project) => {
          try {
            const sectionsResponse = await api.get(`/api/documents/${project.id}/sections`);
            const sections = sectionsResponse.data || [];
            const generatedCount = sections.filter(s => s.content).length;
            const totalCount = project.structure?.structure_data?.length || 0;
            
            return {
              ...project,
              progress: totalCount > 0 ? (generatedCount / totalCount) * 100 : 0,
              generatedCount,
              totalCount,
              status: getProjectStatus(totalCount, generatedCount)
            };
          } catch (err) {
            return {
              ...project,
              progress: 0,
              generatedCount: 0,
              totalCount: 0,
              status: 'draft'
            };
          }
        })
      );
      setProjects(projectsWithStatus);
    } catch (err) {
      showError('Failed to load projects. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProjects();
    }
  }, [user, authLoading, fetchProjects]);

  const getProjectStatus = (total, generated) => {
    if (total === 0) return 'draft';
    if (generated === 0) return 'draft';
    if (generated === total) return 'complete';
    return 'in-progress';
  };

  const handleDeleteClick = (project, e) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      await api.delete(`/api/projects/${projectToDelete.id}`);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      success(`Project "${projectToDelete.title}" deleted successfully`);
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      showError('Failed to delete project. Please try again.');
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-loading">
          <LoadingSpinner size="large" text="Loading your projects..." />
        </div>
      </div>
    );
  }
  
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="dashboard">
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h2 className="dashboard-title">My Projects</h2>
            <p className="dashboard-subtitle">Create and manage your AI-generated documents</p>
          </div>
          <Link to="/projects/new" className="btn btn-primary">
            ➕ Create New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No projects yet</h3>
            <p>Create your first project to get started!</p>
            <Link to="/projects/new" className="btn btn-primary">
              Create New Project
            </Link>
          </div>
        ) : (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-value">{projects.length}</div>
                <div className="stat-label">Total Projects</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {projects.filter(p => p.status === 'complete').length}
                </div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {projects.filter(p => p.status === 'in-progress').length}
                </div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>

            <div className="projects-grid">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="project-card-header">
                    <h3 className="project-card-title">{project.title}</h3>
                    <Badge variant={getBadgeVariant(project.status)}>
                      {project.status === 'complete' ? '✓ Complete' : 
                       project.status === 'in-progress' ? '⚡ In Progress' : 
                       '📝 Draft'}
                    </Badge>
                  </div>
                  
                  <div className="project-card-meta">
                    <div className="meta-item">
                      <span className="meta-label">Type:</span>
                      <Badge variant="primary" size="small">
                        {project.document_type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Topic:</span>
                      <span className="meta-value">{project.topic}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Created:</span>
                      <span className="meta-value">
                        {new Date(project.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {project.totalCount > 0 && (
                    <div className="project-progress">
                      <ProgressBar
                        value={project.progress}
                        max={100}
                        label={`${project.generatedCount} of ${project.totalCount} sections generated`}
                        showPercentage={false}
                        variant={project.status === 'complete' ? 'success' : 'primary'}
                      />
                    </div>
                  )}

                  <div className="project-actions">
                    <button
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                    >
                      🔍 Open
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={(e) => handleDeleteClick(project, e)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        title="Delete Project"
        size="small"
      >
        <p>Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setDeleteModalOpen(false);
              setProjectToDelete(null);
            }}
          >
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleDeleteConfirm}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

function getBadgeVariant(status) {
  switch (status) {
    case 'complete':
      return 'success';
    case 'in-progress':
      return 'warning';
    default:
      return 'draft';
  }
}

export default Dashboard;
