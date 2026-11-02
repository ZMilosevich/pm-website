import { Flag, LockKeyhole, MapPin, ShieldCheck } from "lucide-react";
import { siteConfig } from "../config";
import { Reveal } from "./Reveal";

const safetyItems = [
  {
    title: "Photo verification",
    description:
      "Selfie verification compares your selfie with your profile photo. It confirms a visual match, not your identity, background, or safety.",
    icon: ShieldCheck,
  },
  {
    title: "Location access",
    description:
      "Location access can be approximate or precise, depending on your device permissions. PaceMatcher is designed to limit public exposure of precise location.",
    icon: MapPin,
  },
  {
    title: "Report and block",
    description:
      "Use in-app reporting and blocking tools when an interaction feels wrong. For meetups, choose a public place and tell someone your plans.",
    icon: Flag,
  },
] as const;

export function Safety() {
  return (
    <section className="safety section" id="safety" aria-labelledby="safety-title">
      <div className="page-shell">
        <Reveal className="safety__intro">
          <div>
            <p className="eyebrow">Safety by design</p>
            <h2 id="safety-title">
              Run with clearer
              <span>expectations.</span>
            </h2>
          </div>
          <div className="safety__summary">
            <p>
              Verification and privacy tools support better decisions. They work alongside your
              judgment, device settings, and the choices you make about who to meet.
            </p>
            <a href={siteConfig.privacyPolicyUrl}>
              <LockKeyhole aria-hidden="true" />
              Read the privacy policy
            </a>
          </div>
        </Reveal>

        <div className="safety__grid">
          {safetyItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal className="safety-card" delay={index * 70} key={item.title}>
                <Icon aria-hidden="true" strokeWidth={1.5} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
