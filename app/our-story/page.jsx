import PlaceholderPage from '@/components/PlaceholderPage';

export const metadata = { title: 'Our Story · Tori & Hai' };

export default function OurStory() {
  return (
    <PlaceholderPage
      title="Our Story"
      icon="♡"
      description="How two people found each other and fell in love."
      hints={[
        'How did you meet?',
        'First date / first impression',
        'The proposal story',
        'Add your favorite photos together',
      ]}
    />
  );
}
