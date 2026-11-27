export default function CeremonyPage() {
  return (
    <main className="event-page">
      <div className="event-page__hero">
        <h1 className="event-page__title">Wedding Ceremony</h1>
        <p className="event-page__date">Friday, May 29, 2027 · 10:00 AM</p>
      </div>

      <div className="event-page__body">
        <section className="event-page__section">
          <h2 className="event-page__section-title">About the Ceremony</h2>
          <p className="event-page__text">
            Placeholder: A brief description of the wedding ceremony — its style, cultural elements,
            and what guests can look forward to.
          </p>
        </section>

        <section className="event-page__section">
          <h2 className="event-page__section-title">Location</h2>
          <p className="event-page__text">Vietnam Buddhist Center</p>
          <p className="event-page__text">10002 Synott Rd, Sugar Land TX 77478</p>
          <p className="event-page__detail">🚗 Parking available on site</p>
          <a
            className="event-page__map-link"
            href="https://maps.google.com/?q=10002+Synott+Rd,+Sugar+Land+TX+77478"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps →
          </a>
        </section>

        <section className="event-page__section">
          <h2 className="event-page__section-title">What to Expect</h2>
          <p className="event-page__text">
            Placeholder: Overview of the ceremony order — processional, vows, rituals, estimated duration, etc.
          </p>
        </section>

        <section className="event-page__section">
          <h2 className="event-page__section-title">Attire</h2>
          <p className="event-page__text">Placeholder: Dress code guidance for the wedding ceremony.</p>
        </section>
      </div>
    </main>
  );
}
