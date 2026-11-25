import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";

document.documentElement.classList.add("js");

if (new URLSearchParams(window.location.search).has("runclub_events")) {
  void import("./run-main");
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
