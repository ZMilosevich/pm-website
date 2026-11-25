import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PublicRunPage } from "./pages/PublicRunPage";
import "./styles/global.css";
import "./styles/public-run.css";

document.documentElement.classList.add("js");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PublicRunPage />
  </StrictMode>,
);
