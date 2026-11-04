import { Reveal } from "./Reveal";

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.85-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.354V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const team = [
  {
    name: "Andre Tulloch",
    role: "Co-Founder · CEO",
    contribution: "Drives product strategy and growth.",
    avatar: "andre",
    linkedin: "https://www.linkedin.com/in/andre-edison-tulloch/",
  },
  {
    name: "Zack Milosevich",
    role: "Co-Founder · Design",
    contribution: "Leads UX/UI and creative direction.",
    avatar: "zack",
    linkedin: "https://www.linkedin.com/in/zmilosevich/",
  },
  {
    name: "Varad Shinde",
    role: "Co-Founder · Engineering",
    contribution: "Leads cloud and platform engineering.",
    avatar: "varad",
    linkedin: "https://www.linkedin.com/in/varad-shinde-7b80b2215/",
  },
] as const;

export function Team() {
  return (
    <section className="team section" id="our-story" aria-labelledby="team-title">
      <div className="page-shell">
        <Reveal className="team__intro">
          <p className="eyebrow team__eyebrow">People behind the pace</p>
          <img
            className="team__founder-portrait"
            src="/images/andre-running-seattle.png"
            alt="Andre wearing running gear and a magenta head wrap"
            width="819"
            height="1200"
            loading="lazy"
            decoding="async"
          />
          <div className="team__story-copy">
            <h2 id="team-title">
              Built from a simple challenge: finding people to run with.
            </h2>
            <p className="team__mission">
              Running has helped me explore cities, build friendships, and find community. After
              moving from Brooklyn to Seattle, I realized that finding someone whose pace, schedule,
              and goals aligned with mine wasn’t always easy—even with running clubs around.
            </p>
            <p className="team__mission">
              I didn’t want to replace those communities. I wanted another way to connect when our
              plans lined up. That experience inspired PaceMatcher: a place to discover compatible
              people, start conversations, and coordinate runs or walks.
            </p>
            <figure className="team__signature">
              <blockquote className="team__pullquote">
                Find your pace. Find your person.
              </blockquote>
              <figcaption className="team__attribution">
                — Andre Tulloch, Co-Founder &amp; CEO
              </figcaption>
            </figure>
          </div>
        </Reveal>
        <div className="team__details">
          <p className="eyebrow team__details-label">The team</p>
          <div className="team__members">
            {team.map((person) => (
              <div className="team-member" key={person.name}>
                <div
                  className={`team-member__avatar team-member__avatar--${person.avatar}`}
                  aria-hidden="true"
                />
                <div className="team-member__copy">
                  <div className="team-member__name">
                    <p>{person.name}</p>
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${person.name} on LinkedIn`}
                    >
                      <LinkedInIcon />
                    </a>
                  </div>
                  <span>{person.role}</span>
                  <small>{person.contribution}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
