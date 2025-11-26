import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import Navbar from './layout/Navbar';
import SectionSidebar from './project/SectionSidebar';
import SectionEditor from './project/SectionEditor';
import ProgressBar from './ui/ProgressBar';
import Badge from './ui/Badge';
import LoadingSpinner from './ui/LoadingSpinner';
import Modal from './ui/Modal';
import './ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState(null);
  const [refiningSectionId, setRefiningSectionId] = useState(null);
  const [refinementPrompts, setRefinementPrompts] = useState({});
  const [comments, setComments] = useState({});
  const [exportModalOpen, setExportModalOpen] = useState(false);
  
  const { success, error: showError } = useToast();

  const fetchProject = useCallback(async () => {
    try {
      const response = await api.get(`/api/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      showError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  const fetchSections = useCallback(async () => {
    try {
      const response = await api.get(`/api/documents/${id}/sections`);
      setSections(response.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchSections();
  }, [fetchProject, fetchSections]);

  const handleGenerateSection = async (sectionIndex) => {
    setGeneratingSection(sectionIndex);
    try {
      await api.post(
        `/api/generation/generate-section?project_id=${parseInt(id)}&section_index=${sectionIndex}`,
        {}
      );
      await fetchSections();
      success(`Section ${sectionIndex + 1} generated successfully!`);
    } catch (err) {
      showError(err.response?.data?.detail || `Failed to generate section ${sectionIndex + 1}`);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateAll = async () => {
    if (!project || !project.structure) return;
    
    setGenerating(true);
    const structure = project.structure.structure_data || [];
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < structure.length; i++) {
        setGeneratingSection(i);
        try {
          await api.post(
            `/api/generation/generate-section?project_id=${parseInt(id)}&section_index=${i}`,
            {}
          );
          await fetchSections();
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          failCount++;
          console.error(`Error generating section ${i}:`, err);
        }
      }

      if (successCount > 0) {
        success(`Generated ${successCount} section${successCount > 1 ? 's' : ''} successfully!`);
      }
      if (failCount > 0) {
        showError(`Failed to generate ${failCount} section${failCount > 1 ? 's' : ''}`);
      }
    } catch (err) {
      showError('Failed to generate content');
    } finally {
      setGenerating(false);
      setGeneratingSection(null);
    }
  };

  const handleRefine = async (sectionId) => {
    const prompt = refinementPrompts[sectionId];
    if (!prompt || !prompt.trim()) {
      showError('Please enter a refinement prompt');
      return;
    }

    setRefiningSectionId(sectionId);
    try {
      await api.post('/api/refinement/refine', {
        project_id: parseInt(id),
        section_id: sectionId,
        refinement_prompt: prompt
      });
      setRefinementPrompts({ ...refinementPrompts, [sectionId]: '' });
      await fetchSections();
      success('Content refined successfully!');
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to refine content');
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
      success(`Feedback submitted! Thank you for your ${feedback}.`);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to submit feedback');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/api/export/${id}/download`, {
        responseType: 'blob'
      });

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
      window.URL.revokeObjectURL(url);
      
      success('Document exported successfully!');
      setExportModalOpen(false);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to export document');
    }
  };

  const handleAddSection = async (title) => {
    try {
      await api.post(`/api/documents/${id}/sections`, {
        title: title
      });
      await fetchProject();
      await fetchSections();
      // Select the newly added section
      const newStructure = project.structure?.structure_data || [];
      setCurrentSectionIndex(newStructure.length - 1);
      success(`Section "${title}" added successfully!`);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to add section');
      throw err;
    }
  };

  const getSectionData = (index) => {
    return sections.find(s => s.section_index === index);
  };

  const getProgress = () => {
    if (!project || !project.structure) return 0;
    const total = project.structure.structure_data?.length || 0;
    const generated = sections.filter(s => s.content).length;
    return total > 0 ? (generated / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner fullScreen text="Loading project..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="error">Project not found</div>
          <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const structure = project.structure?.structure_data || [];
  const currentSection = structure[currentSectionIndex];
  const currentSectionData = getSectionData(currentSectionIndex);
  const currentSectionId = currentSectionData?.id || null;
  const currentContent = currentSectionData?.content || '';
  const hasContent = !!currentContent;

  return (
    <div className="project-detail">
      <Navbar />
      <div className="project-detail-container">
        <div className="project-detail-header">
          <div className="header-info">
            <h2 className="project-title">{project.title}</h2>
            <div className="project-meta">
              <Badge variant="primary" size="medium">
                {project.document_type.toUpperCase()}
              </Badge>
              <span className="project-topic">
                <strong>Topic:</strong> {project.topic}
              </span>
            </div>
          </div>
          <Link to="/dashboard" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        {structure.length > 0 && (
          <div className="project-progress-section">
            <ProgressBar
              value={getProgress()}
              max={100}
              label={`${sections.filter(s => s.content).length} of ${structure.length} sections generated`}
              variant={getProgress() === 100 ? 'success' : 'primary'}
            />
          </div>
        )}

        <div className="project-detail-content">
          {structure.length > 0 ? (
            <>
              <SectionSidebar
                sections={structure}
                currentIndex={currentSectionIndex}
                onSelectSection={setCurrentSectionIndex}
                documentType={project.document_type}
                sectionsData={sections}
                onAddSection={handleAddSection}
              />
              
              <div className="project-detail-main">
                <SectionEditor
                  sectionIndex={currentSectionIndex}
                  sectionTitle={currentSection || `Untitled ${project.document_type === 'docx' ? 'Section' : 'Slide'}`}
                  sectionId={currentSectionId}
                  content={currentContent}
                  documentType={project.document_type}
                  isGenerating={generatingSection === currentSectionIndex}
                  isRefining={refiningSectionId === currentSectionId}
                  refinementPrompt={refinementPrompts[currentSectionId] || ''}
                  onRefinementPromptChange={(value) =>
                    setRefinementPrompts({ ...refinementPrompts, [currentSectionId]: value })
                  }
                  comment={comments[currentSectionId] || ''}
                  onCommentChange={(value) =>
                    setComments({ ...comments, [currentSectionId]: value })
                  }
                  onGenerate={handleGenerateSection}
                  onRefine={handleRefine}
                  onFeedback={handleFeedback}
                  hasContent={hasContent}
                />

                {sections.length === 0 && (
                  <div className="generate-all-section">
                    <div className="card">
                      <h3>🚀 Generate All Content</h3>
                      <p>Generate content for all sections at once</p>
                      <button
                        className="btn btn-primary"
                        onClick={handleGenerateAll}
                        disabled={generating}
                      >
                        {generating ? (
                          <>
                            <LoadingSpinner size="small" inline />
                            Generating... {generatingSection !== null && `(Section ${generatingSection + 1} of ${structure.length})`}
                          </>
                        ) : (
                          <>✨ Generate All Content</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-structure">
              <div className="card">
                <h3>No Structure Defined</h3>
                <p>This project doesn't have a structure yet. Please add sections or slides.</p>
              </div>
            </div>
          )}
        </div>

        {sections.length > 0 && (
          <div className="export-fab" onClick={() => setExportModalOpen(true)}>
            📥 Export
          </div>
        )}
      </div>

      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Document"
        size="small"
      >
        <p>Export your document as <strong>{project.document_type.toUpperCase()}</strong> format.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setExportModalOpen(false)}
          >
            Cancel
          </button>
          <button className="btn btn-success" onClick={handleExport}>
            📥 Export {project.document_type.toUpperCase()}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default ProjectDetail;
