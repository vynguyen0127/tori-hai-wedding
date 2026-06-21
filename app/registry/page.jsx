import PlaceholderPage from '@/components/PlaceholderPage';

export const metadata = { title: 'Registry · Tori & Hai' };

export default function Registry() {
  return (
    <PlaceholderPage
      title="Registry"
      icon="🎁"
      description="Your presence is the greatest gift — but if you'd like to celebrate us further, here's where to look."
      hints={[
        'Zola: [link]',
        'Crate & Barrel: [link]',
        'Amazon: [link]',
        'Honeymoon fund: [link]',
      ]}
    />
  );
}
