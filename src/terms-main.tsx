import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TermsOfServicePage } from "./pages/TermsOfServicePage";
import "./styles/global.css";

document.documentElement.classList.add("js");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TermsOfServicePage />
  </StrictMode>,
);
