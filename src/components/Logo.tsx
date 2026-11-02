import { siteConfig } from "../config";

type LogoProps = {
  href?: string;
  className?: string;
};

export function Logo({ href = "#top", className = "" }: LogoProps) {
  return (
    <a className={`wordmark ${className}`.trim()} href={href} aria-label={`${siteConfig.name} home`}>
      <img src="/images/pacematcher-logo.png" alt="" aria-hidden="true" />
      <span>Pace</span>Matcher
    </a>
  );
}
