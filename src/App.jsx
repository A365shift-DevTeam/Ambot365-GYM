import { useEffect, useState } from "react";
import ContactSection from "./components/ContactSection.jsx";
import FacilitiesSection from "./components/FacilitiesSection.jsx";
import Footer from "./components/Footer.jsx";
import FrameLoader from "./components/FrameLoader.jsx";
import Header from "./components/Header.jsx";
import HeroSection from "./components/HeroSection.jsx";
import OfferSection from "./components/OfferSection.jsx";
import PricingSection from "./components/PricingSection.jsx";
import TrainerSection from "./components/TrainerSection.jsx";
import WeightCalculator from "./components/WeightCalculator.jsx";
import { useLenis } from "./components/SmoothScroll.jsx";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [headerSolid, setHeaderSolid] = useState(false);
  const lenis = useLenis();

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
    window.addEventListener("resize", updateHeaderState);

    if (lenis) {
      lenis.on("scroll", updateHeaderState);
      return () => {
        lenis.off("scroll", updateHeaderState);
        window.removeEventListener("resize", updateHeaderState);
      };
    }

    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("resize", updateHeaderState);
    };
  }, [lenis]);

  return (
    <>
      {isLoading && <FrameLoader onComplete={() => setIsLoading(false)} />}
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
