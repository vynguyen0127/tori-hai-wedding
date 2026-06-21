import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function Travel() {
  return (
    <PlaceholderPage
      title="Travel & Stay"
      icon="✈️"
      description="Help out-of-town guests plan their trip with hotel blocks, airport info, and local recommendations."
      hints={[
        'Hotel room block: [Hotel Name], group code: [CODE], deadline: [Date]',
        'Nearest airports: [Airport 1], [Airport 2]',
        'Shuttle or transportation from hotel to venue',
        'Local restaurant and activity recommendations',
        'Uber/Lyft availability in the area',
      ]}
    />
  );
}
