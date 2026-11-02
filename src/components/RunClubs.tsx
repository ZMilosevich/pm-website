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
    description: "Browse by pace, distance and area.",
    icon: MapPin,
  },
  {
    title: "Join local events",
    description: "RSVP to group runs in a tap.",
    icon: CalendarDays,
  },
  {
    title: "Chat before you go",
    description: "Meet the group before the run.",
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
              <span>Find your club.</span>
              <span>
                Find your <em>crew.</em>
              </span>
            </h2>
            <p className="runclubs__description">
              Join local run clubs and their events right in the app. Every group run lists its
              pace and distance, so you always show up to the right one.
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
                    <span>Pace</span>6:00 /km
                  </p>
                  <p>
                    <span>Distance</span>5 km
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
