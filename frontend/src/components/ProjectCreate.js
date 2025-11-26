import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import Navbar from './layout/Navbar';
import LoadingSpinner from './ui/LoadingSpinner';
import './ProjectCreate.css';

function ProjectCreate() {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('docx');
  const [topic, setTopic] = useState('');
  const [structure, setStructure] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  
  const { user } = useAuth();
  const { success, error: showError } = useToast();
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
      showError('Please enter a topic first');
      return;
    }

    setGeneratingTemplate(true);
    try {
      const projectResponse = await api.post('/api/projects', {
        title: title || 'Untitled Project',
        document_type: documentType,
        topic: topic
      });

      const projectId = projectResponse.data.id;

      const templateResponse = await api.post(`/api/generation/generate-template?project_id=${projectId}`);
      const generatedStructure = templateResponse.data.structure_data;

      setStructure(generatedStructure);
      if (!title) {
        setTitle('Untitled Project');
      }

      await api.post(`/api/projects/${projectId}/structure`, {
        structure_data: generatedStructure
      });

      success('AI template generated successfully!');
      setTimeout(() => navigate(`/projects/${projectId}`), 1000);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to generate template. Please try again.');
      setGeneratingTemplate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validStructure = structure.filter(s => s.trim());
    if (validStructure.length === 0) {
      showError('Please add at least one section/slide');
      return;
    }

    setLoading(true);

    try {
      const projectResponse = await api.post('/api/projects', {
        title: title || 'Untitled Project',
        document_type: documentType,
        topic: topic
      });

      const projectId = projectResponse.data.id;

      await api.post(`/api/projects/${projectId}/structure`, {
        structure_data: validStructure
      });

      success('Project created successfully!');
      setTimeout(() => navigate(`/projects/${projectId}`), 1000);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to create project. Please try again.');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="project-create">
      <Navbar />
      <div className="container">
        <div className="create-header">
          <div>
            <h2 className="create-title">✨ Create New Project</h2>
            <p className="create-subtitle">Set up your document structure and start generating content</p>
          </div>
          <Link to="/dashboard" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card create-form-card">
            <div className="form-group">
              <label>Project Title <span className="optional">(optional)</span></label>
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
                className="document-type-select"
              >
                <option value="docx">📄 Microsoft Word (.docx)</option>
                <option value="pptx">📊 Microsoft PowerPoint (.pptx)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Main Topic *</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the main topic or prompt for your document (e.g., 'A market analysis of the EV industry in 2025')"
                required
                rows="4"
              />
            </div>

            <div className="ai-template-section">
              <button
                type="button"
                className="btn btn-success btn-block"
                onClick={handleGenerateTemplate}
                disabled={generatingTemplate || !topic.trim()}
              >
                {generatingTemplate ? (
                  <>
                    <LoadingSpinner size="small" inline />
                    Generating AI Outline...
                  </>
                ) : (
                  <>✨ AI-Suggest Outline</>
                )}
              </button>
              <p className="ai-template-hint">
                🤖 Let AI generate an outline based on your topic. You can edit it afterward.
              </p>
            </div>
          </div>

          <div className="card structure-builder-card">
            <div className="structure-header">
              <h3 className="structure-title">
                {documentType === 'docx' ? '📑 Document Outline' : '📊 Slide Titles'}
              </h3>
              <p className="structure-subtitle">
                {documentType === 'docx'
                  ? 'Add section headers for your document'
                  : 'Add titles for each slide'}
              </p>
            </div>

            <div className="structure-list">
              {structure.map((item, index) => (
                <div key={index} className="structure-item">
                  <span className="structure-number">{index + 1}</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleStructureChange(index, e.target.value)}
                    placeholder={
                      documentType === 'docx'
                        ? `Section ${index + 1} title`
                        : `Slide ${index + 1} title`
                    }
                    className="structure-input"
                  />
                  <div className="structure-actions">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ⬆️
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === structure.length - 1}
                      title="Move down"
                    >
                      ⬇️
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleRemoveItem(index)}
                      disabled={structure.length === 1}
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="structure-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddItem}
              >
                ➕ Add {documentType === 'docx' ? 'Section' : 'Slide'}
              </button>
            </div>
          </div>

          <div className="create-actions">
            <button
              type="submit"
              className="btn btn-primary btn-large btn-block"
              disabled={loading || generatingTemplate}
            >
              {loading ? (
                <>
                    <LoadingSpinner size="small" inline />
                    Creating Project...
                </>
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

export default ProjectCreate;
