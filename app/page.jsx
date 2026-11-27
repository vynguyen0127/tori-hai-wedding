import Link from 'next/link';
import Image from 'next/image';
import Countdown from '@/components/Countdown';
import EnvelopeIntro from '@/components/EnvelopeIntro';
import { list } from '@vercel/blob';

export default async function Home() {
  const { blobs } = await list({ prefix: 'gallery/', limit: 4 });
  const photos = blobs
    .filter((b) => /\.(jpe?g|png|webp|gif|avif)$/i.test(b.pathname))
    .slice(0, 4);

  const left  = photos.slice(0, 2);
  const right = photos.slice(2, 4);

  return (
    <>
      <EnvelopeIntro />
      <div className="home-hero">
        {left.length > 0 && (
          <div className="home-hero-photos home-hero-photos--left">
            {left.map((p, i) => (
              <div key={p.url} className={`home-hero-photo home-hero-photo--${i}`}>
                <Image src={p.url} alt="" fill style={{ objectFit: 'cover' }} sizes="200px" quality={70} />
              </div>
            ))}
          </div>
        )}

        <div className="home-hero-content">
          <p className="home-pre-title">You are cordially invited</p>
          <h1 className="home-names">Tori &amp; Hai</h1>
          <div className="home-divider">✿ ✦ ✿</div>
          <p className="home-date">May 29, 2027</p>
          <p className="home-location">White Oaks on the Bayou · Houston, TX</p>
          <Countdown />
          <Link href="/rsvp" className="home-rsvp-btn">RSVP</Link>
        </div>

        {right.length > 0 && (
          <div className="home-hero-photos home-hero-photos--right">
            {right.map((p, i) => (
              <div key={p.url} className={`home-hero-photo home-hero-photo--${i}`}>
                <Image src={p.url} alt="" fill style={{ objectFit: 'cover' }} sizes="200px" quality={70} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
