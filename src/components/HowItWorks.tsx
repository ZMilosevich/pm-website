import { Footprints, MessageCircle, UsersRound, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

const steps: Array<{ number: string; title: string; description: string; icon: LucideIcon }> = [
  {
    number: "01",
    title: "Set your preferences",
    description: "Choose your pace, distance, location, and goals.",
    icon: Footprints,
  },
  {
    number: "02",
    title: "Discover compatible people",
    description: "Explore runners and walkers whose preferences align with yours.",
    icon: UsersRound,
  },
  {
    number: "03",
    title: "Connect and coordinate",
    description: "Start a conversation and plan a run or walk together.",
    icon: MessageCircle,
  },
];

export function HowItWorks() {
  return (
    <section className="how-it-works section" id="how-it-works" aria-labelledby="how-title">
      <div className="page-shell">
        <Reveal className="pace-strip">
          <p className="eyebrow">Every pace has a place.</p>
          <p className="pace-strip__categories" aria-label="Pace categories">
            <span>Walkers</span>
            <span>Joggers</span>
            <span>Runners</span>
          </p>
        </Reveal>

        <Reveal className="how-it-works__heading">
          <h2 id="how-title">
            Find your people{" "}
            <span>in three simple steps.</span>
          </h2>
        </Reveal>

        <div className="steps-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal className="step" delay={index * 80} key={step.number}>
                <span className="step__number">{step.number}</span>
                <div className="step__icon">
                  <Icon aria-hidden="true" strokeWidth={1.55} />
                </div>
                <div className="step__copy">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
