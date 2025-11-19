import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState(null); // Track which section is being generated
  const [refiningSectionId, setRefiningSectionId] = useState(null);
  const [refinementPrompts, setRefinementPrompts] = useState({});
  const [comments, setComments] = useState({});
  
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchProject();
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/api/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await api.get(`/api/documents/${id}/sections`);
      setSections(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateSection = async (sectionIndex) => {
    setGeneratingSection(sectionIndex);
    setError('');

    try {
      console.log(`Generating section ${sectionIndex} for project:`, id);
      const response = await api.post(
        `/api/generation/generate-section?project_id=${parseInt(id)}&section_index=${sectionIndex}`,
        {}
      );
      
      console.log('Section generation response:', response.data);
      
      // Refresh sections to show generated content
      await fetchSections();
    } catch (err) {
      console.error('Section generation error:', err);
      setError(err.response?.data?.detail || err.message || `Failed to generate section ${sectionIndex + 1}`);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateAll = async () => {
    if (!project || !project.structure) return;
    
    setGenerating(true);
    setError('');

    const structure = project.structure.structure_data || [];
    const generatedSections = [];
    const failedSections = [];

    try {
      // Generate sections one by one
      for (let i = 0; i < structure.length; i++) {
        setGeneratingSection(i);
        
        try {
          console.log(`Generating section ${i} of ${structure.length}`);
          await api.post(
            `/api/generation/generate-section?project_id=${parseInt(id)}&section_index=${i}`,
            {}
          );
          
          generatedSections.push(i);
          // Refresh after each successful generation
          await fetchSections();
          
          // Small delay to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Error generating section ${i}:`, err);
          failedSections.push(i);
        }
      }

      if (generatedSections.length > 0) {
        setError('');
        // Refresh one final time
        await fetchSections();
      }
      
      if (failedSections.length > 0) {
        setError(`Generated ${generatedSections.length} sections. Failed to generate ${failedSections.length} section(s).`);
      } else if (generatedSections.length === 0) {
        setError('No content was generated. Please check the backend logs for errors.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
      setGeneratingSection(null);
    }
  };

  const handleRefine = async (sectionId) => {
    const prompt = refinementPrompts[sectionId];
    if (!prompt || !prompt.trim()) {
      alert('Please enter a refinement prompt');
      return;
    }

    setRefiningSectionId(sectionId);
    setError('');

    try {
      await api.post('/api/refinement/refine', {
        project_id: parseInt(id),
        section_id: sectionId,
        refinement_prompt: prompt
      });

      setRefinementPrompts({ ...refinementPrompts, [sectionId]: '' });
      await fetchSections();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to refine content');
    } finally {
      setRefiningSectionId(null);
    }
  };

  const handleFeedback = async (sectionId, feedback) => {
    const comment = comments[sectionId] || '';

    try {
      await api.post('/api/refinement/feedback', {
        project_id: parseInt(id),
        section_id: sectionId,
        feedback: feedback,
        comment: comment
      });

      setComments({ ...comments, [sectionId]: '' });
      alert('Feedback submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit feedback');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/api/export/${id}/download`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `document.${project.document_type}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to export document');
    }
  };

  const getSectionContent = (sectionIndex) => {
    const section = sections.find(s => s.section_index === sectionIndex);
    return section?.content || '';
  };

  const getSectionId = (sectionIndex) => {
    const section = sections.find(s => s.section_index === sectionIndex);
    return section?.id || null;
  };

  if (loading) {
    return (
      <div>
        <Navbar user={user} logout={logout} />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <Navbar user={user} logout={logout} />
        <div className="container">
          <div className="error">Project not found</div>
          <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const structure = project.structure?.structure_data || [];

  return (
    <div>
      <Navbar user={user} logout={logout} />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              📄 {project.title}
            </h2>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge badge-primary">{project.document_type.toUpperCase()}</span>
              <span style={{ color: 'var(--gray)', fontSize: '15px' }}>
                <strong>Topic:</strong> {project.topic}
              </span>
            </div>
          </div>
          <Link to="/dashboard" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Generate Content Section */}
        {sections.length === 0 && (
          <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '2px solid var(--primary-light)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--dark)' }}>✨ Content Generation</h3>
            <p style={{ marginBottom: '24px', fontSize: '15px', color: 'var(--gray)' }}>
              No content has been generated yet. Click the button below to generate content for all sections.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleGenerateAll}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="loading-text">⚡ Generating...</span>
                  {generatingSection !== null && ` (Section ${generatingSection + 1} of ${structure.length})`}
                </>
              ) : (
                <>✨ Generate All Content</>
              )}
            </button>
            <p style={{ marginTop: '16px', color: 'var(--gray)', fontSize: '14px' }}>
              💡 Or generate individual sections below for better control
            </p>
          </div>
        )}

        {/* Sections */}
        {structure.map((title, index) => {
          const sectionId = getSectionId(index);
          const content = getSectionContent(index);
          const hasContent = !!content;

          return (
            <div key={index} className="card section-item">
              <h4>
                {project.document_type === 'docx' ? `Section ${index + 1}: ` : `Slide ${index + 1}: `}
                {title}
              </h4>

              {hasContent ? (
                <>
                  <div className="section-content" style={{ position: 'relative' }}>
                    {content}
                  </div>

                  {/* Refinement Controls */}
                  <div className="refinement-controls">
                    <div className="refinement-input">
                      <input
                        type="text"
                        placeholder="Enter refinement prompt (e.g., 'Make this more formal', 'Convert to bullet points', 'Shorten to 100 words')"
                        value={refinementPrompts[sectionId] || ''}
                        onChange={(e) =>
                          setRefinementPrompts({
                            ...refinementPrompts,
                            [sectionId]: e.target.value
                          })
                        }
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRefine(sectionId)}
                        disabled={refiningSectionId === sectionId}
                      >
                        {refiningSectionId === sectionId ? (
                          <>⚡ Refining...</>
                        ) : (
                          <>✨ Refine</>
                        )}
                      </button>
                    </div>

                    {/* Feedback Controls */}
                    <div className="feedback-controls">
                      <button
                        className="btn btn-success"
                        onClick={() => handleFeedback(sectionId, 'like')}
                        style={{ minWidth: '120px' }}
                      >
                        👍 Like
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleFeedback(sectionId, 'dislike')}
                        style={{ minWidth: '120px' }}
                      >
                        👎 Dislike
                      </button>
                    </div>

                    {/* Comment Box */}
                    <div className="comment-box">
                      <textarea
                        placeholder="Add a comment or note..."
                        value={comments[sectionId] || ''}
                        onChange={(e) =>
                          setComments({
                            ...comments,
                            [sectionId]: e.target.value
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '8px', border: '2px dashed #f59e0b' }}>
                  <p style={{ color: 'var(--warning)', fontStyle: 'italic', marginBottom: '16px', fontWeight: 500 }}>
                    ⏳ Content not generated yet.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGenerateSection(index)}
                    disabled={generatingSection === index || generating}
                  >
                    {generatingSection === index ? (
                      <>⚡ Generating...</>
                    ) : (
                      <>✨ Generate This Section</>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Regenerate All Button */}
        {sections.length > 0 && (
          <div className="card">
            <button
              className="btn btn-secondary"
              onClick={handleGenerateAll}
              disabled={generating}
            >
              {generating ? (
                <>⚡ Regenerating... {generatingSection !== null && `(Section ${generatingSection + 1} of ${structure.length})`}</>
              ) : (
                <>🔄 Regenerate All Content</>
              )}
            </button>
          </div>
        )}

        {/* Export Section */}
        {sections.length > 0 && (
          <div className="export-section">
            <div className="card">
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--dark)' }}>📥 Export Document</h3>
              <p style={{ marginBottom: '24px', fontSize: '15px', color: 'var(--gray)' }}>
                Download your completed document in {project.document_type.toUpperCase()} format.
              </p>
              <button
                className="btn btn-success"
                onClick={handleExport}
                style={{ fontSize: '16px', padding: '14px 28px' }}
              >
                📥 Export {project.document_type.toUpperCase()}
              </button>
            </div>
          </div>
        )}
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

export default ProjectDetail;

