import { createRoot } from "react-dom/client";
import { Header } from "./components/Header";
import "./styles/global.css";

createRoot(document.getElementById("error-header")!).render(
  <Header homeLinkBase="/" showNavigation={false} />,
);
