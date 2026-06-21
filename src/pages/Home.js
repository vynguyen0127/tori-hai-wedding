import React from 'react';
import Countdown from '../components/Countdown';
import './Home.css';

export default function Home({ setActivePage }) {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-pre-title">We're getting married</p>
          <h1 className="home-names">Tori &amp; Hai</h1>
          <div className="home-divider">✦</div>
          <p className="home-date">June 5, 2027</p>
          <p className="home-location">📍 [Venue Name] · [City, State]</p>
          <Countdown />
          <button className="home-rsvp-btn" onClick={() => setActivePage('rsvp')}>
            RSVP
          </button>
        </div>
      </section>
    </div>
  );
}
