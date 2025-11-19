import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch projects if user is loaded and authenticated
    if (user && !authLoading) {
      console.log('Dashboard: User authenticated, fetching projects');
      fetchProjects();
    } else {
      console.log('Dashboard: Waiting for authentication', { user, authLoading });
    }
  }, [user, authLoading]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/api/projects/${projectId}`);
        setProjects(projects.filter(p => p.id !== projectId));
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <Navbar user={user} logout={logout} />
        <div className="loading">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div>
      <Navbar user={user} logout={logout} />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>My Projects</h2>
            <p style={{ color: 'var(--gray)', fontSize: '16px' }}>Create and manage your AI-generated documents</p>
          </div>
          <Link to="/projects/new" className="btn btn-primary">
            ➕ Create New Project
          </Link>
        </div>

        {error && <div className="error">{error}</div>}

        {projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>Create your first project to get started!</p>
            <Link to="/projects/new" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Create New Project
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                className="card project-card"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <h3>{project.title}</h3>
                <div className="project-card-meta">
                  <p><span style={{ fontWeight: 600, color: 'var(--dark)' }}>📄 Type:</span> <span className="badge badge-primary">{project.document_type.toUpperCase()}</span></p>
                  <p style={{ marginTop: '8px' }}><span style={{ fontWeight: 600, color: 'var(--dark)' }}>📝 Topic:</span> {project.topic}</p>
                  <p style={{ marginTop: '8px' }}><span style={{ fontWeight: 600, color: 'var(--dark)' }}>📅 Created:</span> {new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <div className="project-actions">
                  <button
                    className="btn btn-primary"
                    onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}`); }}
                  >
                    🔍 Open
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={(e) => handleDelete(project.id, e)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Navbar({ user, logout }) {
  return (
    <div className="navbar">
      <h1>🤖 AI Document Authoring Platform</h1>
      <div className="navbar-user">
        <span>👤 {user?.username}</span>
        <Link to="/dashboard">📊 Dashboard</Link>
        <button className="btn btn-secondary" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;

