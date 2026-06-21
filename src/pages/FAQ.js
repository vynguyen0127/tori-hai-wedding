import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function FAQ() {
  return (
    <PlaceholderPage
      title="FAQ"
      icon="💬"
      description="Answer the questions your guests will definitely ask before they think to email you."
      hints={[
        'Is the ceremony indoors or outdoors?',
        'Are kids welcome?',
        'What should I wear? (dress code details)',
        'Can I take photos during the ceremony?',
        'Where should I park?',
        'What time should I arrive?',
        'Will there be a bar / is it open bar?',
      ]}
    />
  );
}
