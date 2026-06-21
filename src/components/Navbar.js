import React, { useState } from 'react';
import './Navbar.css';

const tabs = [
  { label: 'Home', path: 'home' },
  { label: 'Our Story', path: 'our-story' },
  { label: 'Details', path: 'details' },
  { label: 'Wedding Party', path: 'wedding-party' },
  { label: 'Gallery', path: 'gallery' },
  { label: 'Registry', path: 'registry' },
  { label: 'RSVP', path: 'rsvp' },
  { label: 'Travel & Stay', path: 'travel' },
  { label: 'FAQ', path: 'faq' },
];

export default function Navbar({ activePage, setActivePage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (path) => {
    setActivePage(path);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => handleNav('home')}>
        T &amp; H
      </div>
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>
      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {tabs.map((tab) => (
          <li
            key={tab.path}
            className={activePage === tab.path ? 'active' : ''}
            onClick={() => handleNav(tab.path)}
          >
            {tab.label}
          </li>
        ))}
      </ul>
    </nav>
  );
}
