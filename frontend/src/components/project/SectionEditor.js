import React from 'react';
import './SectionEditor.css';

function SectionEditor({
  sectionIndex,
  sectionTitle,
  sectionId,
  content,
  documentType,
  isGenerating,
  isRefining,
  refinementPrompt,
  onRefinementPromptChange,
  comment,
  onCommentChange,
  onGenerate,
  onRefine,
  onFeedback,
  hasContent
}) {
  return (
    <div className="section-editor">
      <div className="section-editor-header">
        <div>
          <h3 className="section-editor-title">
            {documentType === 'docx' ? 'Section' : 'Slide'} {sectionIndex + 1}: {sectionTitle}
          </h3>
          <p className="section-editor-subtitle">
            {documentType === 'docx' ? 'Document Section' : 'Presentation Slide'}
          </p>
        </div>
      </div>

      <div className="section-editor-content">
        {hasContent ? (
          <>
            <div className="content-display">
              <div className="content-header">
                <span className="content-label">Generated Content</span>
              </div>
              <div className="content-text">{content || 'No content available'}</div>
            </div>

            {/* Refinement Controls */}
            <div className="refinement-panel">
              <div className="panel-header">
                <h4>✨ Refine Content</h4>
                <p className="panel-subtitle">
                  Ask AI to modify this section (e.g., "Make it more formal", "Add bullet points", "Shorten to 100 words")
                </p>
              </div>
              <div className="refinement-input-group">
                <input
                  type="text"
                  className="refinement-input"
                  placeholder="Enter refinement prompt..."
                  value={refinementPrompt || ''}
                  onChange={(e) => onRefinementPromptChange(e.target.value)}
                  disabled={isRefining}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => onRefine(sectionId)}
                  disabled={!refinementPrompt?.trim() || isRefining}
                >
                  {isRefining ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Refining...
                    </>
                  ) : (
                    <>✨ Refine</>
                  )}
                </button>
              </div>
            </div>

            {/* Feedback Controls */}
            <div className="feedback-panel">
              <div className="panel-header">
                <h4>💬 Feedback & Comments</h4>
              </div>
              <div className="feedback-buttons">
                <button
                  className="btn btn-success"
                  onClick={() => onFeedback(sectionId, 'like')}
                >
                  👍 Like
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => onFeedback(sectionId, 'dislike')}
                >
                  👎 Dislike
                </button>
              </div>
              <div className="comment-section">
                <textarea
                  className="comment-textarea"
                  placeholder="Add a comment or note about this section..."
                  value={comment || ''}
                  onChange={(e) => onCommentChange(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="empty-section-state">
            <div className="empty-icon">📝</div>
            <h4>No Content Generated Yet</h4>
            <p>Generate content for this section to get started.</p>
            <button
              className="btn btn-primary btn-large"
              onClick={() => onGenerate(sectionIndex)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Generating...
                </>
              ) : (
                <>✨ Generate Content</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SectionEditor;

