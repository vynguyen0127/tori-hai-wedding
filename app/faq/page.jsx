import PlaceholderPage from '@/components/PlaceholderPage';

export const metadata = { title: 'FAQ · Tori & Hai' };

export default function FAQ() {
  return (
    <PlaceholderPage
      title="FAQ"
      icon="💬"
      description="Answers to the questions we get asked most often."
      hints={[
        'Is there parking at the venue?',
        'What is the dress code?',
        'Are children welcome?',
        'Will there be a shuttle from the hotel?',
        'Can I take photos during the ceremony?',
        'What time should I arrive?',
      ]}
    />
  );
}
