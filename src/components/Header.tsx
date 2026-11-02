import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";

const navigation = [
  { label: "How it works", href: "#how-it-works" },
  { label: "The app", href: "#app" },
  { label: "RunClubs", href: "#runclubs" },
  { label: "Safety", href: "#safety" },
  { label: "Our story", href: "#our-story" },
  { label: "FAQ", href: "#faq" },
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
        requestAnimationFrame(() => menuToggleRef.current?.focus());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("(min-width: 901px)").matches) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Logo />

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="button button--outline header-cta" href="#download">
          Get the app
        </a>

        <button
          ref={menuToggleRef}
          className="menu-toggle"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <nav
        className={`mobile-nav ${isMenuOpen ? "is-open" : ""}`}
        id="mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
      >
        <div className="mobile-nav__inner">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>
              {item.label}
            </a>
          ))}
          <a
            className="button button--outline"
            href="#download"
            onClick={closeMenu}
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Get the app
          </a>
        </div>
      </nav>
    </header>
  );
}
