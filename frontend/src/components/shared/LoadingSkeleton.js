import React from 'react';

export function ProjectCardSkeleton() {
  return (
    <div className="card project-card skeleton">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-button"></div>
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="card section-item skeleton">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text skeleton-short"></div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {[1, 2, 3].map((i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

