import { siteConfig } from "../config";

type StoreBadgesProps = {
  className?: string;
  platform?: "ios" | "android";
};

export function StoreBadges({ className = "", platform }: StoreBadgesProps) {
  const classes = [
    "store-badges",
    platform ? "store-badges--single" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} aria-label="Download PaceMatcher">
      {platform !== "android" && (
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
      )}
      {platform !== "ios" && (
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
      )}
    </div>
  );
}
