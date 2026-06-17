import { useEffect, useState } from "react";
import ContactSection from "./components/ContactSection.jsx";
import FacilitiesSection from "./components/FacilitiesSection.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import HeroSection from "./components/HeroSection.jsx";
import OfferSection from "./components/OfferSection.jsx";
import PricingSection from "./components/PricingSection.jsx";
import TrainerSection from "./components/TrainerSection.jsx";
import WeightCalculator from "./components/WeightCalculator.jsx";

export default function App() {
  const [headerSolid, setHeaderSolid] = useState(false);

  useEffect(() => {
    const updateHeaderState = () => {
      const hero = document.getElementById("home");

      if (!hero) {
        setHeaderSolid(true);
        return;
      }

      setHeaderSolid(hero.getBoundingClientRect().bottom <= 80);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("resize", updateHeaderState);

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("resize", updateHeaderState);
    };
  }, []);

  return (
    <>
      <Header className={headerSolid ? "site-header-solid" : "site-header-transparent"} />
      <HeroSection>

      <main>
        <FacilitiesSection />
        <WeightCalculator />
        <PricingSection />
        <OfferSection />
        <TrainerSection />
        <ContactSection />
      </main>
      <Footer />
      </HeroSection>
    </>
  );
}
