import Link from 'next/link';
import Countdown from '@/components/Countdown';
import EnvelopeIntro from '@/components/EnvelopeIntro';

export default function Home() {
  return (
    <>
      <EnvelopeIntro />
      <div className="home-hero">
        <div className="home-hero-content">
          <p className="home-pre-title">You are cordially invited</p>
          <h1 className="home-names">Victoria &amp; Hai</h1>
          <div className="home-divider">✿ ✦ ✿</div>
          <p className="home-date">May 29, 2027</p>
          <p className="home-location">White Oaks on the Bayou · Houston, TX</p>
          <Countdown />
          <Link href="/rsvp" className="home-rsvp-btn">RSVP</Link>
        </div>
      </div>
    </>
  );
}
