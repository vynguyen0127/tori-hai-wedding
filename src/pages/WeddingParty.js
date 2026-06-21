import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function WeddingParty() {
  return (
    <PlaceholderPage
      title="Wedding Party"
      icon="🌸"
      description="Introduce your bridesmaids, groomsmen, flower girls, and anyone else standing by your side."
      hints={[
        'Photo + name + role for each member',
        'A short fun bio or how you know them',
        'Maid of Honor & Best Man spotlights',
      ]}
    />
  );
}
