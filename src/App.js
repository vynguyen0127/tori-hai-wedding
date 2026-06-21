import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OurStory from './pages/OurStory';
import Details from './pages/Details';
import WeddingParty from './pages/WeddingParty';
import Gallery from './pages/Gallery';
import Registry from './pages/Registry';
import RSVP from './pages/RSVP';
import Travel from './pages/Travel';
import FAQ from './pages/FAQ';
import './App.css';

const pages = {
  'home': Home,
  'our-story': OurStory,
  'details': Details,
  'wedding-party': WeddingParty,
  'gallery': Gallery,
  'registry': Registry,
  'rsvp': RSVP,
  'travel': Travel,
  'faq': FAQ,
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const PageComponent = pages[activePage] || Home;

  return (
    <div className="app">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main>
        <PageComponent setActivePage={setActivePage} />
      </main>
      <footer className="footer">
        <p>Made with ♡ for Tori &amp; Hai · June 5, 2027</p>
      </footer>
    </div>
  );
}
