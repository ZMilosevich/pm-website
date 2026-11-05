import { StoreBadges } from "./StoreBadges";
import TextFlip from "./animata/text/text-flip";

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
          <p className="eyebrow hero__eyebrow">WALK. JOG. RUN. TOGETHER.</p>
          <h1 id="hero-title" aria-label="Find your pace. Find your person.">
            <span aria-hidden="true">Find your </span>
            <TextFlip />
          </h1>
          <p className="hero__description">
            Find company for the run or walk you have in mind. Discover runners and walkers who fit
            your pace, location, and goals. Connect, chat, and coordinate your next run or walk.
          </p>
          <div className="hero__actions">
            <StoreBadges className="store-badges--hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
