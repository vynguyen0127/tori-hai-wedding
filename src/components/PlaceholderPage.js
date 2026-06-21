import React from 'react';
import './PlaceholderPage.css';

export default function PlaceholderPage({ title, description, icon, hints }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <div className="placeholder-icon">{icon || '✦'}</div>
        <h2 className="placeholder-title">{title}</h2>
        {description && <p className="placeholder-desc">{description}</p>}
        {hints && hints.length > 0 && (
          <ul className="placeholder-hints">
            {hints.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        )}
        <div className="placeholder-badge">Coming Soon</div>
      </div>
    </div>
  );
}
