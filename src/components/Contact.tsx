import { ArrowRight } from "lucide-react";
import { siteConfig } from "../config";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section className="contact section" id="contact" aria-labelledby="contact-title">
      <div className="page-shell contact__grid">
        <Reveal>
          <h2 id="contact-title">
            Let&apos;s talk <span>pace.</span>
          </h2>
        </Reveal>
        <Reveal className="contact__details" delay={100}>
          <p>
            Questions, feedback or collaboration ideas?
            <br />
            We&apos;re all ears.
          </p>
          <a href={`mailto:${siteConfig.contactEmail}`}>
            <ArrowRight aria-hidden="true" />
            <span>{siteConfig.contactEmail}</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
