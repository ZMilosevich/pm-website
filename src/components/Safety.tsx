import { Flag, LockKeyhole, MapPin, ShieldCheck } from "lucide-react";
import { siteConfig } from "../config";
import { Reveal } from "./Reveal";

const safetyItems = [
  {
    title: "Photo verification",
    description:
      "Selfie verification compares a selfie with a profile photo. It does not verify legal identity, background, or safety.",
    icon: ShieldCheck,
  },
  {
    title: "Location privacy",
    description:
      "Manage location permissions through your device settings. PaceMatcher is designed to limit public exposure of precise location information.",
    icon: MapPin,
  },
  {
    title: "Report and block",
    description:
      "Use in-app tools to manage unwanted interactions. Meet in public, use your judgment, and tell someone you trust about your plans.",
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
              Connect with clearer{" "}
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
