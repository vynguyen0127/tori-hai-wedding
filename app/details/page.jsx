export const metadata = { title: 'Wedding Details · Tori & Hai' };

export default function Details() {
  return (
    <div className="details-page">
      <header className="details-header">
        <p className="details-header__eyebrow">Tori &amp; Hai</p>
        <h1 className="details-header__title">Wedding Details</h1>
        <p className="details-header__date">May 29, 2027 &nbsp;·&nbsp; Houston, TX</p>
      </header>

      <div className="details-sections">

        {/* Reception */}
        <section className="details-card">
          <div className="details-card__label">The Big Day</div>
          <h2 className="details-card__title">Reception</h2>
          <div className="details-card__rows">
            <div className="details-card__row">
              <span className="details-card__icon">📅</span>
              <span>Friday, May 29, 2027</span>
            </div>
            <div className="details-card__row">
              <span className="details-card__icon">🥂</span>
              <div>
                <div>Cocktail Hour &nbsp;·&nbsp; 6:00 PM</div>
                <div className="details-card__subtext">Reception &nbsp;·&nbsp; 7:00 PM</div>
              </div>
            </div>
            <div className="details-card__row">
              <span className="details-card__icon">📍</span>
              <div>
                <div>White Oaks on the Bayou</div>
                <div>7920 Farm to Market 1489</div>
                <div>Simonton, TX 77476</div>
                <a
                  href="https://maps.google.com/?q=7920+Farm+to+Market+1489+Simonton+TX+77476"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="details-card__map-link"
                >
                  Open in Maps →
                </a>
              </div>
            </div>
            <div className="details-card__row">
              <span className="details-card__icon">🚗</span>
              <span>Parking available on site</span>
            </div>
          </div>
        </section>

        {/* Dress Code */}
        <section className="details-card details-card--dress">
          <div className="details-card__label">Attire</div>
          <h2 className="details-card__title">Dress Code</h2>
          <p className="details-card__dress-style">Black Tie Formal</p>
          <p className="details-card__dress-note">
            We kindly ask guests to avoid wearing white, pink, red, or green —
            these colors are reserved for the wedding party and family.
          </p>
          <div className="details-card__swatches">
            <div className="details-card__swatch-group">
              <div className="details-card__swatch-label">Please avoid</div>
              <div className="details-card__swatch-row">
                <div className="details-card__swatch" style={{ background: '#fff', border: '1px solid #ddd' }} title="White"></div>
                <div className="details-card__swatch" style={{ background: '#f4a7b9' }} title="Pink"></div>
                <div className="details-card__swatch" style={{ background: '#c0392b' }} title="Red"></div>
                <div className="details-card__swatch" style={{ background: '#27ae60' }} title="Green"></div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
