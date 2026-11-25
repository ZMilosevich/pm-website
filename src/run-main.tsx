import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PublicRunPage, type PublicRunEvent } from "./pages/PublicRunPage";
import "./styles/global.css";
import "./styles/public-run.css";

document.documentElement.classList.add("js");

const eventUrl = "/r/greenlake-sun/event.json";
const rootElement = document.getElementById("root")!;
const errorNotice = document.getElementById("run-data-error")!;
const loader = document.getElementById("run-loader")!;

async function loadRun() {
  errorNotice.hidden = true;
  loader.hidden = false;
  rootElement.inert = true;

  try {
    const response = await fetch(eventUrl, { cache: "no-cache" });
    if (!response.ok) throw new Error("Could not load the run event");

    const event: PublicRunEvent = await response.json();
    if (!event?.title || !event.area || !event.club || !Array.isArray(event.attendeesPreview)) {
      throw new Error("Invalid run event data");
    }

    createRoot(rootElement).render(
      <StrictMode>
        <PublicRunPage event={event} />
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
