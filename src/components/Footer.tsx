import { footerDestinations, siteConfig } from "../config";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="site-footer__top">
          <Logo />
          <p>{siteConfig.location}</p>
          <nav className="footer-links" aria-label="Footer navigation">
            {footerDestinations.map((destination) => {
              return (
                <a
                  key={destination.key}
                  href={destination.url}
                >
                  {destination.label}
                </a>
              );
            })}
          </nav>
          <p className="site-footer__copyright">
            © {siteConfig.copyrightYear} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
