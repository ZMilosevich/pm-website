import { AppShowcase } from "./components/AppShowcase";
import { Contact } from "./components/Contact";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { RunClubs } from "./components/RunClubs";
import { Safety } from "./components/Safety";
import { Team } from "./components/Team";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <AppShowcase />
        <RunClubs />
        <Safety />
        <Team />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
