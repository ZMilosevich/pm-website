import {
  ArrowRight,
  CalendarDays,
  MapPin,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";

const features: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Discover clubs nearby",
    description: "Explore local running communities and their activities.",
    icon: MapPin,
  },
  {
    title: "Join local events",
    description: "Review pace and schedule information and RSVP in the app.",
    icon: CalendarDays,
  },
  {
    title: "Connect before you go",
    description: "Use available messaging to coordinate plans.",
    icon: MessageCircle,
  },
];

export function RunClubs() {
  return (
    <section className="runclubs section" id="runclubs" aria-labelledby="runclubs-title">
      <div className="page-shell">
        <Reveal className="runclubs-panel">
          <div className="runclubs-panel__copy">
            <p className="eyebrow">RUNCLUBS &amp; EVENTS</p>
            <h2 id="runclubs-title">
              <span>Find your club.</span>{" "}
              <span>
                Find your <em>crew.</em>
              </span>
            </h2>
            <p className="runclubs__description">
              Discover local running clubs and events, explore activity details, and connect with
              the community.
            </p>
            <div className="runclubs-preview" aria-hidden="true">
              <div className="runclubs-preview__top">
                <div className="runclubs-preview__club">
                  <span className="runclubs-preview__mark" aria-hidden="true">
                    <MapPin size={19} strokeWidth={1.7} />
                  </span>
                  <div>
                    <p className="runclubs-preview__when">SATURDAY · 8:30 AM</p>
                    <h3>Riverside Run Club</h3>
                  </div>
                </div>
                <div className="runclubs-preview__actions">
                  <span className="runclubs-preview__tag">In the app</span>
                  <span className="runclubs-preview__rsvp">
                    RSVP
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>

              <div className="runclubs-preview__bottom">
                <div className="runclubs-preview__metrics">
                  <p>
                    <span>Pace</span>9:39 /mi
                  </p>
                  <p>
                    <span>Distance</span>3.1 mi
                  </p>
                </div>
                <div className="runclubs-preview__attendees">
                  <span className="runclubs-avatar-stack" aria-hidden="true">
                    <span>A</span>
                    <span>M</span>
                    <span>J</span>
                  </span>
                  <span>12 runners going</span>
                </div>
              </div>
            </div>
            <div className="club-cta">
              <span className="club-cta__label">Run a club?</span>
              <a
                className="button button--primary"
                href="mailto:contact@pacematcher.com?subject=RunClub%20listing"
              >
                List it with us
                <ArrowRight aria-hidden="true" size={18} />
              </a>
            </div>
          </div>

          <ul className="runclubs-feature-list" aria-label="RunClub features">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li className="runclubs-feature" key={feature.title}>
                  <Icon aria-hidden="true" size={24} strokeWidth={1.5} />
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>

      </div>
    </section>
  );
}
