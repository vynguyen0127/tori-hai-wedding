import PlaceholderPage from '@/components/PlaceholderPage';

export const metadata = { title: 'Gallery · Tori & Hai' };

export default function Gallery() {
  return (
    <PlaceholderPage
      title="Gallery"
      icon="📷"
      description="Our favorite moments together — engagement photos and beyond."
      hints={[
        'Engagement photo shoot gallery',
        'Candid moments & memories',
        'Post-wedding: reception & ceremony highlights',
      ]}
    />
  );
}
