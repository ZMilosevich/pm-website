import { StoreBadges } from "./StoreBadges";

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <img
        className="hero__image"
        src="https://pacematcher.com/wp-content/uploads/2025/12/pacematcher_hero-scaled.jpg"
        alt="Two runners sharing a waterfront run at golden hour"
        width="2400"
        height="1243"
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
