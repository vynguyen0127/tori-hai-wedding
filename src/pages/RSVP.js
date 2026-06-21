import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function RSVP() {
  return (
    <PlaceholderPage
      title="RSVP"
      icon="✉️"
      description="Let your guests confirm their attendance, meal preferences, and any dietary restrictions."
      hints={[
        'RSVP deadline: [Date]',
        'Fields: name, attending yes/no, meal choice, dietary restrictions',
        'Plus-one option if applicable',
        'Connect to Google Forms, Zola, or a custom backend',
      ]}
    />
  );
}
