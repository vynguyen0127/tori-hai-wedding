export const metadata = { title: 'Wedding Party · Tori & Hai' };

const bridesParty = [
  { name: 'Bridesmaid Name', role: 'Maid of Honor' },
  { name: 'Bridesmaid Name', role: 'Bridesmaid' },
  { name: 'Bridesmaid Name', role: 'Bridesmaid' },
  { name: 'Bridesmaid Name', role: 'Bridesmaid' },
  { name: 'Bridesmaid Name', role: 'Bridesmaid' },
  { name: 'Bridesman Name', role: 'Bridesman' },
];

const groomsParty = [
  { name: 'Groomsman Name', role: 'Best Man' },
  { name: 'Groomsman Name', role: 'Groomsman' },
  { name: 'Groomsman Name', role: 'Groomsman' },
  { name: 'Groomsman Name', role: 'Groomsman' },
  { name: 'Groomsman Name', role: 'Groomsman' },
  { name: 'Groomswoman Name', role: 'Groomswoman' },
];

function PartyCard({ name, role }) {
  return (
    <div className="party-card">
      <div className="party-card__photo">
        <span className="party-card__initials">{name.charAt(0)}</span>
      </div>
      <div className="party-card__name">{name}</div>
      <div className="party-card__role">{role}</div>
    </div>
  );
}

export default function WeddingParty() {
  return (
    <div className="party-page">
      <header className="party-header">
        <p className="party-header__eyebrow">Tori &amp; Hai</p>
        <h1 className="party-header__title">Wedding Party</h1>
        <p className="party-header__subtitle">The people we couldn't imagine this day without.</p>
      </header>

      <div className="party-columns">
        <div className="party-column">
          <h2 className="party-column__title">Bride's Party</h2>
          <div className="party-grid">
            {bridesParty.map((p, i) => (
              <PartyCard key={i} {...p} />
            ))}
          </div>
        </div>

        <div className="party-divider" />

        <div className="party-column">
          <h2 className="party-column__title">Groom's Party</h2>
          <div className="party-grid">
            {groomsParty.map((p, i) => (
              <PartyCard key={i} {...p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
