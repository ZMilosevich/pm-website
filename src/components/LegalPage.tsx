import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Logo } from "./Logo";

type LegalPageProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <>
      <a className="skip-link" href="#legal-content">
        Skip to policy content
      </a>
      <header className="site-header legal-header">
        <div className="site-header__inner legal-header__inner">
          <Logo href="/" />
          <a className="legal-home-link" href="/">
            <ArrowLeft aria-hidden="true" />
            Home
          </a>
        </div>
      </header>

      <main className="legal-page" id="legal-content">
        <section className="legal-hero" aria-labelledby="legal-title">
          <div className="page-shell legal-hero__inner">
            <div>
              <p className="eyebrow">PaceMatcher / Legal</p>
              <h1 id="legal-title">{title}</h1>
              <p className="legal-hero__updated">{lastUpdated}</p>
            </div>
            <a className="button button--outline legal-hero__home" href="/">
              <ArrowLeft aria-hidden="true" />
              Back to home
            </a>
          </div>
        </section>

        <div className="page-shell legal-page__body">
          <article className="legal-document">{children}</article>
        </div>
      </main>

      <Footer />
    </>
  );
}
