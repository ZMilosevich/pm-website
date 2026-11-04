import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "../config";
import { Logo } from "./Logo";
import { StoreBadges } from "./StoreBadges";

const navigation = [
  { label: "How it works", href: "#how-it-works" },
  { label: "The app", href: "#app" },
  { label: "RunClubs", href: "#runclubs" },
  { label: "Safety", href: "#safety" },
  { label: "About", href: "#our-story" },
] as const;

type DevicePlatform = "ios" | "android" | "other";

function getDevicePlatform(): DevicePlatform {
  if (typeof navigator === "undefined") return "other";

  const userAgent = navigator.userAgent;
  if (/android/i.test(userAgent)) return "android";
  if (
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  return "other";
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [devicePlatform] = useState(getDevicePlatform);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const headerCtaRef = useRef<HTMLButtonElement>(null);
  const downloadDialogRef = useRef<HTMLDialogElement>(null);

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
  const openDownloadDialog = () => {
    const dialog = downloadDialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setIsDownloadDialogOpen(true);
  };

  const closeDownloadDialog = () => downloadDialogRef.current?.close();

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

        <button
          ref={headerCtaRef}
          className="button button--primary header-cta"
          type="button"
          aria-haspopup="dialog"
          aria-controls="app-download-dialog"
          aria-expanded={isDownloadDialogOpen}
          onClick={openDownloadDialog}
        >
          Get the app
        </button>

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
            className="button button--primary"
            href={`${siteConfig.appRedirectUrl}?src=nav`}
            onClick={closeMenu}
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Get the app
          </a>
        </div>
      </nav>

      <dialog
        ref={downloadDialogRef}
        className="app-download-dialog"
        id="app-download-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-download-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDownloadDialog();
        }}
        onClose={() => {
          setIsDownloadDialogOpen(false);
          requestAnimationFrame(() => {
            const trigger = headerCtaRef.current;
            if (trigger?.offsetParent) trigger.focus();
            else menuToggleRef.current?.focus();
          });
        }}
      >
        <div className="app-download-dialog__content">
          <div className="app-download-dialog__heading">
            <div>
              <p className="eyebrow">Get the app</p>
              <h2 id="app-download-title">Find your running people.</h2>
              <p className="app-download-dialog__reassurance">Free on iOS and Android.</p>
            </div>
            <button
              className="app-download-dialog__close"
              type="button"
              aria-label="Close download dialog"
              onClick={closeDownloadDialog}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <div
            className={`app-download-dialog__options ${
              devicePlatform !== "other" ? "app-download-dialog__options--mobile" : ""
            }`}
          >
            <div className="app-download-dialog__stores">
              <p>
                {devicePlatform === "other"
                  ? "Choose your store"
                  : "Get PaceMatcher for your phone"}
              </p>
              <StoreBadges
                className="store-badges--dialog"
                platform={devicePlatform === "other" ? undefined : devicePlatform}
              />
            </div>
            {devicePlatform === "other" && (
              <a
                className="app-download-dialog__qr"
                href={`${siteConfig.appRedirectUrl}?src=qr`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the app download link, or scan the QR code with your phone"
              >
                <span className="app-download-dialog__qr-frame">
                  <img
                    src="/images/pacematcher-download-qr.svg"
                    alt=""
                    width="144"
                    height="144"
                  />
                </span>
                <span>Scan to open on your phone</span>
              </a>
            )}
          </div>
        </div>
      </dialog>
    </header>
  );
}
