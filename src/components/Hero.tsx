import { useEffect, useState } from "react";
import { StoreBadges } from "./StoreBadges";

const heroImages = [
  {
    src: "https://pacematcher.com/wp-content/uploads/2025/12/pacematcher_hero-scaled.jpg",
    alt: "Two runners sharing a waterfront run at golden hour",
    width: 2400,
    height: 1243,
  },
  {
    src: "/images/hero-runners-city.jpg",
    alt: "Two runners jogging along a waterfront boardwalk with a city skyline",
    width: 1536,
    height: 1024,
  },
] as const;

function getHeroSelection() {
  if (typeof window === "undefined") {
    return { image: heroImages[0], index: null };
  }

  try {
    const lastIndex = window.sessionStorage.getItem("pacematcher-hero-image");
    const nextIndex = lastIndex === "0" ? 1 : 0;
    return { image: heroImages[nextIndex], index: nextIndex };
  } catch {
    const index = Math.floor(Math.random() * heroImages.length);
    return { image: heroImages[index], index: null };
  }
}

export function Hero() {
  const [heroSelection] = useState(getHeroSelection);

  useEffect(() => {
    if (heroSelection.index === null) {
      return;
    }

    try {
      window.sessionStorage.setItem("pacematcher-hero-image", String(heroSelection.index));
    } catch {
      // Keep rendering the selected image if browser storage is unavailable.
    }
  }, [heroSelection]);

  const heroImage = heroSelection.image;

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
