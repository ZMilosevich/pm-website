export type FooterDestination = {
  key: "instagram" | "linkedin" | "privacy" | "terms";
  label: string;
  url: string;
};

export const siteConfig = {
  name: "PaceMatcher",
  contactEmail: "contact@pacematcher.com",
  location: "Seattle, Washington",
  copyrightYear: 2026,
  appStoreUrl: "https://apps.apple.com/ci/app/pacematcher/id6752578460",
  googlePlayUrl:
    "https://play.google.com/store/apps/details?id=com.pacematcher.frontend&hl=en",
  privacyPolicyUrl: "https://pacematcher.com/privacy-policy",
} as const;

export const footerDestinations: FooterDestination[] = [
  {
    key: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/pacematcher/",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/pacematcher",
  },
  {
    key: "privacy",
    label: "Privacy",
    url: siteConfig.privacyPolicyUrl,
  },
  {
    key: "terms",
    label: "Terms",
    url: "https://pacematcher.com/terms-of-service",
  },
];
