import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function Gallery() {
  return (
    <PlaceholderPage
      title="Photo Gallery"
      icon="📷"
      description="Share your engagement photos, favorite memories, and eventually wedding photos here."
      hints={[
        'Engagement photo shoot gallery',
        'Favorite couple photos',
        'Post-wedding: official wedding photos',
        'Photo grid or lightbox layout',
      ]}
    />
  );
}
