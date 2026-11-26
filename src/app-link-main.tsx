import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Logo } from "./components/Logo";
import { StoreBadges } from "./components/StoreBadges";
import "./styles/global.css";
import "./styles/app-link.css";

const invite = {
  title: "You’re invited to PaceMatcher",
  description: "Find runners near you who share your pace and goals. Download PaceMatcher to get started.",
};

const tracker = {
  title: "Track your run",
  description: "Open PaceMatcher and tap Tracker to record a run. If you’re new to PaceMatcher, install it from your app store below.",
};

const explore = {
  title: "Explore running stories and tips",
  description: "Explore brings together training stories and fitness tips. Download PaceMatcher and open the Explore tab to start reading.",
};

const root = document.getElementById("root")!;
const page = root.dataset.page === "tracker" ? tracker : root.dataset.page === "explore" ? explore : invite;

createRoot(root).render(
  <StrictMode>
    <header className="site-header site-header--no-nav">
      <div className="site-header__inner">
        <Logo href="/" />
      </div>
    </header>
    <main className="app-link">
      <h1>{page.title}</h1>
      <p>{page.description}</p>
      <StoreBadges />
    </main>
  </StrictMode>,
);
