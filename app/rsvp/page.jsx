import RsvpFlow from './RsvpFlow';

export const metadata = {
  title: 'RSVP · Tori & Hai',
  description: 'Please let us know if you can make it!',
};

export default function RsvpPage() {
  return (
    <main>
      <RsvpFlow />
    </main>
  );
}
