import PlaceholderPage from '@/components/PlaceholderPage';

export const metadata = { title: 'Wedding Party · Tori & Hai' };

export default function WeddingParty() {
  return (
    <PlaceholderPage
      title="Wedding Party"
      icon="💐"
      description="Meet the special people standing by our side on the big day."
      hints={[
        'Bridesmaids — name, relationship, photo',
        'Groomsmen — name, relationship, photo',
        'Flower girls / ring bearers',
        'Parents of the couple',
      ]}
    />
  );
}
