import {
  Activity,
  MessageCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { StoreBadges } from "./StoreBadges";

const featureList: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Match at your pace",
    description: "Find people who fit your preferred pace, distance and location.",
    icon: Search,
  },
  {
    title: "Plan it in chat",
    description: "Coordinate runs, ask questions and get to know your match.",
    icon: MessageCircle,
  },
  {
    title: "Track your time together",
    description: "Log your runs and keep moving, together.",
    icon: Activity,
  },
];

const utilityStrip: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Pace & distance filters", icon: SlidersHorizontal },
  { label: "In-app chat", icon: MessageCircle },
  { label: "Solo & paired tracking", icon: Activity },
  { label: "Privacy controls", icon: ShieldCheck },
];

export function AppShowcase() {
  return (
    <section className="app-showcase section" id="app" aria-labelledby="app-title">
      <div className="page-shell">
        <Reveal className="app-panel">
          <div className="app-panel__copy">
            <p className="eyebrow">Meet PaceMatcher</p>
            <h2 id="app-title">
              <span>Less searching.</span>
              <span>More moving.</span>
            </h2>

            <div className="app-feature-list">
              {featureList.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div className="app-feature" key={feature.title}>
                    <Icon aria-hidden="true" size={24} strokeWidth={1.5} />
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="app-download" id="download">
              <p className="eyebrow">Get the app</p>
              <StoreBadges className="store-badges--app" />
            </div>
          </div>

          <figure className="product-shot">
            <img
              src="/images/app-screens-three.webp"
              srcSet="
                /images/app-screens-three-1200.webp 1200w,
                /images/app-screens-three-1800.webp 1800w,
                /images/app-screens-three.webp 2374w
              "
              sizes="(max-width: 720px) calc(100vw - 2.5rem), (max-width: 900px) calc(100vw - 3rem), 60vw"
              alt="Three PaceMatcher app screens for runner discovery, match chat, and activity tracking"
              width="2374"
              height="2160"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </Reveal>

        <Reveal className="utility-strip" delay={120}>
          {utilityStrip.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="utility-strip__item" key={feature.label}>
                <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                <span>{feature.label}</span>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
