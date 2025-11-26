import React from 'react';

function StatusBadge({ status, type = 'section' }) {
  const getStatusConfig = () => {
    if (type === 'section') {
      switch (status) {
        case 'not_generated':
          return { text: 'Not Generated', class: 'badge-gray', icon: '⚪' };
        case 'generating':
          return { text: 'Generating...', class: 'badge-warning', icon: '⚡' };
        case 'generated':
          return { text: 'Generated', class: 'badge-success', icon: '✓' };
        case 'refined':
          return { text: 'Refined', class: 'badge-primary', icon: '✨' };
        default:
          return { text: 'Unknown', class: 'badge-gray', icon: '?' };
      }
    } else {
      // Project status
      switch (status) {
        case 'draft':
          return { text: 'Draft', class: 'badge-gray', icon: '📝' };
        case 'generating':
          return { text: 'Generating', class: 'badge-warning', icon: '⚡' };
        case 'ready':
          return { text: 'Ready', class: 'badge-success', icon: '✓' };
        case 'completed':
          return { text: 'Completed', class: 'badge-primary', icon: '✨' };
        default:
          return { text: 'Draft', class: 'badge-gray', icon: '📝' };
      }
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`badge ${config.class}`}>
      <span className="badge-icon">{config.icon}</span>
      {config.text}
    </span>
  );
}

export default StatusBadge;

