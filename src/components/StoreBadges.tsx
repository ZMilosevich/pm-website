import { siteConfig } from "../config";

type StoreBadgesProps = {
  className?: string;
};

export function StoreBadges({ className = "" }: StoreBadgesProps) {
  return (
    <div className={`store-badges ${className}`.trim()} aria-label="Download PaceMatcher">
      <a
        className="store-badge store-badge--apple"
        href={siteConfig.appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download PaceMatcher on the App Store"
      >
        <img
          src="/images/app-store-badge.svg"
          alt="Download on the App Store"
          width="120"
          height="40"
        />
      </a>
      <a
        className="store-badge store-badge--google"
        href={siteConfig.googlePlayUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get PaceMatcher on Google Play"
      >
        <img
          src="/images/google-play-badge.png"
          alt="Get it on Google Play"
          width="646"
          height="250"
        />
      </a>
    </div>
  );
}
