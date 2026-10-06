'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface GalleryProps {
  photos: { url: string; pathname: string }[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }, [photos.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, close, prev, next]);

  // Stable rotation per card — seeded from index so it never changes on re-render
  function rotation(i: number) {
    const angles = [-4, 2, -2.5, 3.5, -1.5, 4, -3, 1.5, -4.5, 2.5];
    return angles[i % angles.length];
  }

  if (photos.length === 0) {
    return (
      <p className="gallery-empty">Photos coming soon.</p>
    );
  }

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, i) => (
          <button
            key={photo.url}
            className="polaroid"
            onClick={() => setLightboxIndex(i)}
            aria-label={`Open photo ${i + 1}`}
            style={{ '--rotation': `${rotation(i)}deg` } as React.CSSProperties}
          >
            <div className="polaroid__photo">
              <Image
                src={photo.url}
                alt={`Photo ${i + 1}`}
                fill
                sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 280px"
                className="polaroid__img"
              />
            </div>
            <div className="polaroid__caption" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
          <button className="lightbox__close" onClick={close} aria-label="Close">✕</button>

          <button
            className="lightbox__arrow lightbox__arrow--prev"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
          >
            ‹
          </button>

          <div className="lightbox__img-wrap" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[lightboxIndex].url}
              alt={`Photo ${lightboxIndex + 1}`}
              fill
              sizes="100vw"
              className="lightbox__img"
              priority
            />
          </div>

          <button
            className="lightbox__arrow lightbox__arrow--next"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
          >
            ›
          </button>

          <div className="lightbox__counter">
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
