import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function ProjectCreate() {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('docx');
  const [topic, setTopic] = useState('');
  const [structure, setStructure] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAddItem = () => {
    setStructure([...structure, '']);
  };

  const handleRemoveItem = (index) => {
    if (structure.length > 1) {
      setStructure(structure.filter((_, i) => i !== index));
    }
  };

  const handleStructureChange = (index, value) => {
    const newStructure = [...structure];
    newStructure[index] = value;
    setStructure(newStructure);
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newStructure = [...structure];
      [newStructure[index - 1], newStructure[index]] = [newStructure[index], newStructure[index - 1]];
      setStructure(newStructure);
    }
  };

  const handleMoveDown = (index) => {
    if (index < structure.length - 1) {
      const newStructure = [...structure];
      [newStructure[index], newStructure[index + 1]] = [newStructure[index + 1], newStructure[index]];
      setStructure(newStructure);
    }
  };

  const handleGenerateTemplate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic first');
      return;
    }

    setGeneratingTemplate(true);
    try {
      // First create project with topic
      const projectResponse = await api.post('/api/projects', {
        title: title || 'Untitled Project',
        document_type: documentType,
        topic: topic
      });

      const projectId = projectResponse.data.id;

      // Generate AI template
      const templateResponse = await api.post(`/api/generation/generate-template?project_id=${projectId}`);
      const generatedStructure = templateResponse.data.structure_data;

      setStructure(generatedStructure);
      if (!title) {
        setTitle('Untitled Project');
      }

      // Save the structure
      await api.post(`/api/projects/${projectId}/structure`, {
        structure_data: generatedStructure
      });

      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate template');
    } finally {
      setGeneratingTemplate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate structure
    const validStructure = structure.filter(s => s.trim());
    if (validStructure.length === 0) {
      setError('Please add at least one section/slide');
      return;
    }

    setLoading(true);

    try {
      // Create project
      const projectResponse = await api.post('/api/projects', {
        title: title || 'Untitled Project',
        document_type: documentType,
        topic: topic
      });

      const projectId = projectResponse.data.id;

      // Save structure
      await api.post(`/api/projects/${projectId}/structure`, {
        structure_data: validStructure
      });

      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar user={user} logout={logout} />
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ✨ Create New Project
          </h2>
          <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: '12px' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="form-group">
              <label>Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project title"
              />
            </div>

            <div className="form-group">
              <label>Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="docx">Microsoft Word (.docx)</option>
                <option value="pptx">Microsoft PowerPoint (.pptx)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Main Topic</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the main topic or prompt for your document (e.g., 'A market analysis of the EV industry in 2025')"
                required
              />
            </div>

            <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: '10px', border: '2px solid var(--primary-light)' }}>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleGenerateTemplate}
                disabled={generatingTemplate || !topic.trim()}
                style={{ width: '100%', marginBottom: '12px' }}
              >
                {generatingTemplate ? (
                  <>⚡ Generating AI Outline...</>
                ) : (
                  <>✨ AI-Suggest Outline</>
                )}
              </button>
              <p style={{ margin: 0, color: 'var(--gray)', fontSize: '14px', textAlign: 'center' }}>
                🤖 Let AI generate an outline based on your topic
              </p>
            </div>
          </div>

          <div className="card structure-builder">
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {documentType === 'docx' ? '📑 Document Outline' : '📊 Slide Titles'}
            </h3>
            <p style={{ color: 'var(--gray)', marginBottom: '24px', fontSize: '15px' }}>
              {documentType === 'docx'
                ? 'Add section headers for your document'
                : 'Add titles for each slide'}
            </p>

            {structure.map((item, index) => (
              <div key={index} className="structure-item">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleStructureChange(index, e.target.value)}
                  placeholder={
                    documentType === 'docx'
                      ? `Section ${index + 1} title`
                      : `Slide ${index + 1} title`
                  }
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  title="Move up"
                >
                  ⬆️
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === structure.length - 1}
                  title="Move down"
                >
                  ⬇️
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRemoveItem(index)}
                  disabled={structure.length === 1}
                  title="Remove"
                >
                  🗑️
                </button>
              </div>
            ))}

            <div className="structure-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddItem}
              >
                ➕ Add {documentType === 'docx' ? 'Section' : 'Slide'}
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <div style={{ marginTop: '32px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', fontSize: '16px', padding: '14px 28px' }}
            >
              {loading ? (
                <>⚡ Creating Project...</>
              ) : (
                <>✨ Create Project</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Navbar({ user, logout }) {
  return (
    <div className="navbar">
      <h1>AI Document Authoring Platform</h1>
      <div className="navbar-user">
        <span>Welcome, {user?.username}</span>
        <Link to="/dashboard">Dashboard</Link>
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProjectCreate;

