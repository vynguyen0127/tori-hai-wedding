export const metadata = { title: 'Our Story · Victoria & Hai' };

export default function OurStory() {
  return (
    <div className="story-page">
      <header className="story-header">
        <p className="story-header__eyebrow">Tori &amp; Hai</p>
        <h1 className="story-header__title">Our Story</h1>
      </header>

      <div className="story-sections">
        <section className="story-section">
          <div className="story-section__content">
            <div className="story-section__text">
              <div className="story-section__label">How We Met</div>
              <h2 className="story-section__title">A Bus Ride Home</h2>
              <div className="story-section__body">
                <p>
                  Tori and Hai had known each other for years, even attending the same temple since
                  2008, but it wasn&apos;t until Moc Lan in Mississippi in 2016 that they truly
                  connected. On the bus ride home, Hai stepped in when Tori was dealing with an
                  unwanted admirer, taking her phone and pretending to be her boyfriend.
                </p>
                <p>
                  After months of talking, Tori finally worked up the courage to admit she had
                  feelings for him. Not long after, Hai made things official with a cheesy pickup
                  line they had joked about: <em>&ldquo;Do you have a pencil? Because I would like
                  to erase your past and write our future together.&rdquo;</em>
                </p>
                <p>
                  And just like that, their story officially began — over text. ❤️
                </p>
              </div>
            </div>
            <div className="story-section__photo story-section__photo--placeholder">
              <span>Photo</span>
            </div>
          </div>
        </section>

        <section className="story-section">
          <div className="story-section__content story-section__content--reverse">
            <div className="story-section__text">
              <div className="story-section__label">The Proposal</div>
              <h2 className="story-section__title">She Said Yes</h2>
              <div className="story-section__body">
                <p>
                  On January 7, 2026, what started as a stressful trip to Vietnam turned into an
                  unforgettable surprise. After our luggage was lost, we spent days buying
                  last-minute clothes, with Hai especially determined to find me the perfect white
                  dress.
                </p>
                <p>
                  He eventually revealed that he had planned a surprise photoshoot in Phu Quoc,
                  leaving us scrambling to get everything ready — even borrowing makeup from Jubin.
                  During the photoshoot, I had a feeling something bigger was coming but tried not
                  to get my hopes up.
                </p>
                <p>
                  Then, on the beach beneath a beautiful flower arch, Hai got down on one knee and
                  proposed — and I said YES! 💍🤍
                </p>
              </div>
            </div>
            <div className="story-section__photo story-section__photo--placeholder">
              <span>Photo</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
