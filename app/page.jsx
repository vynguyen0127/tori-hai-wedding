import Link from 'next/link';
import Image from 'next/image';
import Countdown from '@/components/Countdown';
import EnvelopeIntro from '@/components/EnvelopeIntro';

const PHOTO_LEFT  = 'https://owfn6jdews0xpubv.public.blob.vercel-storage.com/gallery/IMG_5028.JPEG.jpeg';
const PHOTO_RIGHT = 'https://owfn6jdews0xpubv.public.blob.vercel-storage.com/gallery/IMG_5916.JPEG.jpeg';

export default function Home() {
  return (
    <>
      <EnvelopeIntro />
      <div className="home-hero">
        <div className="home-hero-photo-frame home-hero-photo-frame--left">
          <Image src={PHOTO_LEFT} alt="Tori & Hai" fill style={{ objectFit: 'cover' }} sizes="220px" quality={75} />
        </div>

        <div className="home-hero-content">
          <p className="home-pre-title">You are cordially invited</p>
          <h1 className="home-names">Tori &amp; Hai</h1>
          <div className="home-divider">✿ ✦ ✿</div>
          <p className="home-date">May 29, 2027</p>
          <p className="home-location">White Oaks on the Bayou · Houston, TX</p>
          <Countdown />
          <Link href="/rsvp" className="home-rsvp-btn">RSVP</Link>
        </div>

        <div className="home-hero-photo-frame home-hero-photo-frame--right">
          <Image src={PHOTO_RIGHT} alt="Tori & Hai" fill style={{ objectFit: 'cover' }} sizes="220px" quality={75} />
        </div>

        {/* Mobile only — full width below content */}
        <div className="home-hero-photo-mobile">
          <Image src={PHOTO_LEFT} alt="Tori & Hai" fill style={{ objectFit: 'cover' }} sizes="100vw" quality={75} />
        </div>
      </div>
    </>
  );
}
