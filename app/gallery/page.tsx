export const dynamic = 'force-dynamic';

import { list } from '@vercel/blob';
import Gallery from '@/components/Gallery';

export const metadata = { title: 'Gallery · Victoria & Hai' };

export default async function GalleryPage() {
  const { blobs } = await list();

  const photos = blobs
    .filter((b) => /\.(jpe?g|png|webp|gif|avif)$/i.test(b.pathname))
    .map((b) => ({ url: b.url, pathname: b.pathname }));

  return (
    <div className="gallery-page">
      <header className="gallery-header">
        <p className="gallery-header__eyebrow">Tori &amp; Hai</p>
        <h1 className="gallery-header__title">Gallery</h1>
        <p className="gallery-header__subtitle">Our favorite moments together.</p>
      </header>

      <Gallery photos={photos} />
    </div>
  );
}
