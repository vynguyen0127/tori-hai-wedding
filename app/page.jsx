import Link from 'next/link';
import Countdown from '@/components/Countdown';

export default function Home() {
  return (
    <div className="home-hero">
      <div className="home-hero-content">
        <p className="home-pre-title">We&apos;re getting married</p>
        <h1 className="home-names">Tori &amp; Hai</h1>
        <div className="home-divider">✦</div>
        <p className="home-date">June 5, 2027</p>
        <p className="home-location">📍 [Venue Name] · [City, State]</p>
        <Countdown />
        <Link href="/rsvp" className="home-rsvp-btn">RSVP</Link>
      </div>
    </div>
  );
}
