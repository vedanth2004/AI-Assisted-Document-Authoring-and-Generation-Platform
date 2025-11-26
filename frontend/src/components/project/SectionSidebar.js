import React, { useState } from 'react';
import './SectionSidebar.css';

function SectionSidebar({ sections, currentIndex, onSelectSection, documentType, sectionsData = [], onAddSection }) {
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSection = async (e) => {
    e.stopPropagation();
    if (!newSectionTitle.trim()) {
      return;
    }

    setIsAdding(true);
    try {
      if (onAddSection) {
        await onAddSection(newSectionTitle.trim());
        setNewSectionTitle('');
        setShowAddSection(false);
      }
    } catch (error) {
      console.error('Error adding section:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddSection(e);
    } else if (e.key === 'Escape') {
      setShowAddSection(false);
      setNewSectionTitle('');
    }
  };
  const getSectionStatus = (index) => {
    const section = sectionsData.find(s => s.section_index === index);
    if (!section || !section.content) return 'not-generated';
    if (section.content) return 'generated';
    return 'not-generated';
  };

  const getStatusIcon = (index) => {
    const status = getSectionStatus(index);
    switch (status) {
      case 'generated':
        return '✓';
      case 'not-generated':
        return '○';
      default:
        return '○';
    }
  };

  const getStatusClass = (index) => {
    const status = getSectionStatus(index);
    return `section-item-status status-${status}`;
  };

  return (
    <aside className="section-sidebar">
      <div className="sidebar-header">
        <h3>{documentType === 'docx' ? '📑 Sections' : '📊 Slides'}</h3>
        <span className="section-count">{sections.length} {documentType === 'docx' ? 'sections' : 'slides'}</span>
      </div>
      <div className="sidebar-content">
        {sections.map((title, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`sidebar-section-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectSection(index)}
            >
              <div className="section-item-header">
                <span className={getStatusClass(index)}>
                  {getStatusIcon(index)}
                </span>
                <span className="section-item-number">
                  {documentType === 'docx' ? 'Section' : 'Slide'} {index + 1}
                </span>
              </div>
              <div className="section-item-title" title={title}>
                {title || `Untitled ${documentType === 'docx' ? 'Section' : 'Slide'}`}
              </div>
            </div>
          );
        })}
        
        {showAddSection ? (
          <div className="add-section-input-container" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              className="add-section-input"
              placeholder={`Enter ${documentType === 'docx' ? 'section' : 'slide'} title...`}
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
            />
            <div className="add-section-actions">
              <button
                className="btn-add-section-confirm"
                onClick={handleAddSection}
                disabled={isAdding || !newSectionTitle.trim()}
              >
                ✓
              </button>
              <button
                className="btn-add-section-cancel"
                onClick={() => {
                  setShowAddSection(false);
                  setNewSectionTitle('');
                }}
                disabled={isAdding}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-add-section"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddSection(true);
            }}
            title={`Add new ${documentType === 'docx' ? 'section' : 'slide'}`}
          >
            ➕ Add {documentType === 'docx' ? 'Section' : 'Slide'}
          </button>
        )}
      </div>
    </aside>
  );
}

export default SectionSidebar;

