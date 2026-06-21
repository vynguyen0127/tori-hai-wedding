import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function OurStory() {
  return (
    <PlaceholderPage
      title="Our Story"
      icon="💌"
      description="Share how you two met, your favorite memories together, and the story of your engagement."
      hints={[
        'How did you meet?',
        'Your favorite date or moment together',
        'The proposal story',
        'A photo timeline of your relationship',
      ]}
    />
  );
}
