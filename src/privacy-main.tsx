import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import "./styles/global.css";

document.documentElement.classList.add("js");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivacyPolicyPage />
  </StrictMode>,
);
