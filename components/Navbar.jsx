'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'Home',          path: '/'             },
  { label: 'Our Story',     path: '/our-story'    },
  { label: 'Details',       path: '/details'      },
  { label: 'Wedding Party', path: '/wedding-party' },
  { label: 'Gallery',       path: '/gallery'      },
  { label: 'Registry',      path: '/registry'     },
  { label: 'RSVP',          path: '/rsvp'         },
  { label: 'Travel & Stay', path: '/travel'       },
  { label: 'FAQ',           path: '/faq'          },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
        T &amp; H
      </Link>

      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {tabs.map((tab) => (
          <li key={tab.path}>
            <Link
              href={tab.path}
              className={pathname === tab.path ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
