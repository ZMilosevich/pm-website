import { Reveal } from "./Reveal";

const team = [
  {
    name: "Andre Tulloch",
    role: "Founder & CEO",
    contribution: "Drives product strategy and growth.",
  },
  {
    name: "Zack Milosevich",
    role: "Co-Founder, Product Design",
    contribution: "Leads UX/UI and creative direction.",
  },
  {
    name: "Varad Shinde",
    role: "Co-Founder, Engineering",
    contribution: "Leads cloud and platform engineering.",
  },
] as const;

export function Team() {
  return (
    <section className="team section" id="our-story" aria-labelledby="team-title">
      <div className="page-shell">
        <Reveal className="team__intro">
          <p className="eyebrow">People behind the pace</p>
          <div>
            <h2 id="team-title">A shared run starts with a shared idea.</h2>
            <p className="team__mission">
              PaceMatcher is built around a simple purpose: make it easier to find someone whose
              pace, plans, and expectations fit yours. Matching, conversation, tracking, and safety
              tools live together in one place, with room for every pace.
            </p>
          </div>
        </Reveal>
        <div className="team__details">
          <p className="eyebrow team__details-label">The team</p>
          <div className="team__members">
            {team.map((person) => (
              <div className="team-member" key={person.name}>
                <p>{person.name}</p>
                <span>{person.role}</span>
                <small>{person.contribution}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
