import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PublicRunPage, type PublicRunEvent } from "./pages/PublicRunPage";
import "./styles/global.css";
import "./styles/public-run.css";

document.documentElement.classList.add("js");

const eventSources = new Map([
  ["greenlake-sun-2026", "/r/greenlake-sun/event.json"],
  ["seattle-marathon-2026", "/r/seattle-marathon-2026/event.json"],
]);

const rootElement = document.getElementById("root")!;
const errorNotice = document.getElementById("run-data-error")!;
const loader = document.getElementById("run-loader")!;

function getEventSource() {
  const slug = new URLSearchParams(window.location.search).get("runclub_events") ?? "";
  const eventUrl = eventSources.get(slug);
  if (!eventUrl) return null;

  const shareUrl = new URL("https://pacematcher.com/");
  shareUrl.searchParams.set("runclub_events", slug);
  return { eventUrl, shareUrl: shareUrl.href };
}

function setMetaContent(selector: string, content: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.content = content;
}

function updateStructuredData(event: PublicRunEvent, shareUrl: string) {
  const script = document.head.querySelector<HTMLScriptElement>(
    'script[type="application/ld+json"]',
  );
  if (!script) return;

  const organizerName = event.organizer?.name ?? event.club?.name ?? "";
  script.textContent = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": event.kind === "race" ? "SportsEvent" : "Event",
      name: event.title,
      description: event.description,
      startDate: event.startsAt,
      eventStatus:
        event.status === "cancelled"
          ? "https://schema.org/EventCancelled"
          : "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      url: shareUrl,
      image: "https://pacematcher.com/images/og-pacematcher.jpg",
      location: {
        "@type": "Place",
        name: event.area.label,
        address: {
          "@type": "PostalAddress",
          addressLocality: event.city,
          addressRegion: "WA",
          addressCountry: "US",
        },
      },
      organizer: {
        "@type": "Organization",
        name: organizerName,
      },
    },
    null,
    2,
  );
}

function updatePageMetadata(event: PublicRunEvent, shareUrl: string) {
  const pageTitle = `${event.title} · PaceMatcher`;
  const organizerName = event.organizer?.name ?? event.club?.name ?? "";
  const summary = `${event.description} · ${event.city} · ${organizerName}`;

  document.title = pageTitle;
  setMetaContent('meta[name="description"]', event.description);
  setMetaContent('meta[name="robots"]', "noindex, nofollow");
  setMetaContent('meta[property="og:title"]', pageTitle);
  setMetaContent('meta[property="og:description"]', summary);
  setMetaContent('meta[property="og:url"]', shareUrl);
  setMetaContent('meta[name="twitter:title"]', pageTitle);
  setMetaContent('meta[name="twitter:description"]', summary);

  document
    .querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?.setAttribute("href", shareUrl);
  updateStructuredData(event, shareUrl);
}

async function loadRun() {
  errorNotice.hidden = true;
  loader.hidden = false;
  rootElement.inert = true;

  try {
    const eventSource = getEventSource();
    if (!eventSource) {
      const message = errorNotice.querySelector("span");
      if (message) message.textContent = "Run event not found.";
      const retry = errorNotice.querySelector("button");
      if (retry) retry.hidden = true;
      errorNotice.hidden = false;
      return;
    }
    const { eventUrl, shareUrl } = eventSource;
    const response = await fetch(eventUrl, { cache: "no-cache" });
    if (!response.ok) throw new Error("Could not load the run event");

    const event: PublicRunEvent = await response.json();
    if (
      !event?.title ||
      !event.area ||
      (!event.club && !event.organizer) ||
      !Array.isArray(event.attendeesPreview)
    ) {
      throw new Error("Invalid run event data");
    }

    updatePageMetadata(event, shareUrl);
    createRoot(rootElement).render(
      <StrictMode>
        <PublicRunPage event={event} shareUrl={shareUrl} />
      </StrictMode>,
    );
  } catch {
    errorNotice.hidden = false;
  } finally {
    loader.hidden = true;
    rootElement.inert = false;
  }
}

errorNotice.querySelector("button")?.addEventListener("click", loadRun);
void loadRun();
