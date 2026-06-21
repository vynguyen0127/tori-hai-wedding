import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function Registry() {
  return (
    <PlaceholderPage
      title="Registry"
      icon="🎁"
      description="Links to your wedding registries so guests can find the perfect gift."
      hints={[
        'Zola, The Knot, Amazon, Crate & Barrel, etc.',
        'Add a short note about your preferences',
        'Consider a honeymoon fund option',
      ]}
    />
  );
}
