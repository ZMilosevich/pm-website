import { Reveal } from "./Reveal";
import { StoreBadges } from "./StoreBadges";

export function Contact() {
  return (
    <section className="contact section" id="contact" aria-labelledby="contact-title">
      <div className="page-shell contact__grid">
        <Reveal>
          <h2 id="contact-title">
            Have a run or <span>walk in mind?</span>
          </h2>
        </Reveal>
        <Reveal className="contact__details" delay={100}>
          <p>
            Find people who fit your pace, location, and goals. Start a conversation and see where
            your next connection takes you.
          </p>
          <StoreBadges className="store-badges--contact" />
        </Reveal>
      </div>
    </section>
  );
}
