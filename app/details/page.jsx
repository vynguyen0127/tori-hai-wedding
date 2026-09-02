import PlaceholderPage from '@/components/PlaceholderPage';

export const metadata = { title: 'Wedding Details · Victoria & Hai' };

export default function Details() {
  return (
    <PlaceholderPage
      title="Wedding Details"
      icon="🕊️"
      description="All the important information your guests need to know about the ceremony and reception."
      hints={[
        'Ceremony: [Date], [Time] at [Venue Name]',
        'Reception: [Time] at [Venue Name or Same Location]',
        'Dress code: [e.g. Black Tie / Cocktail / Garden Party]',
        'Parking and transportation info',
        'Ceremony and reception addresses with map links',
      ]}
    />
  );
}
