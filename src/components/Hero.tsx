import { StoreBadges } from "./StoreBadges";

const heroImage = {
  src: "/images/hero-runners-city.jpg",
  alt: "Two runners jogging along a waterfront boardwalk with a city skyline",
  width: 1536,
  height: 1024,
};

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <img
        className="hero__image"
        src={heroImage.src}
        alt={heroImage.alt}
        width={heroImage.width}
        height={heroImage.height}
        fetchPriority="high"
      />
      <div className="hero__wash" aria-hidden="true" />

      <div className="page-shell hero__inner">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">Walk. Jog. Run. Together.</p>
          <h1 id="hero-title">
            <span>Your pace.</span>
            <span>
              Your <em>people.</em>
            </span>
          </h1>
          <p className="hero__description">
            Find people who move like you. Match by pace, goals and location, and make your next
            outing a shared one.
          </p>
          <div className="hero__actions">
            <StoreBadges className="store-badges--hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
