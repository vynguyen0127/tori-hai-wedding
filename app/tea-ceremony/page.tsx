export default function TeaCeremonyPage() {
  return (
    <main className="event-page">
      <div className="event-page__hero">
        <h1 className="event-page__title">Tea Ceremony</h1>
        <p className="event-page__date">Thursday, May 28, 2027 · 12:00 PM</p>
      </div>

      <div className="event-page__body">
        <section className="event-page__section">
          <h2 className="event-page__section-title">About the Tea Ceremony</h2>
          <p className="event-page__text">
            Placeholder: A brief description of what the Vietnamese tea ceremony is — its cultural significance,
            what guests can expect, and the role it plays in the wedding.
          </p>
        </section>

        <section className="event-page__section">
          <h2 className="event-page__section-title">Location</h2>
          <p className="event-page__text">19311 Round Prairie Lane, Cypress TX 77433</p>
          <p className="event-page__detail">🔑 Gate code: #2514</p>
          <p className="event-page__detail">🚗 Street parking only</p>
          <a
            className="event-page__map-link"
            href="https://maps.google.com/?q=19311+Round+Prairie+Lane,+Cypress+TX+77433"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps →
          </a>
        </section>

        <section className="event-page__section">
          <h2 className="event-page__section-title">What to Expect</h2>
          <p className="event-page__text">
            Placeholder: A brief rundown of the ceremony flow — arrival, the tea serving ritual,
            family introductions, estimated duration, etc.
          </p>
        </section>

        <section className="event-page__section">
          <h2 className="event-page__section-title">Attire</h2>
          <p className="event-page__text">Placeholder: Dress code guidance for the tea ceremony.</p>
        </section>
      </div>
    </main>
  );
}
