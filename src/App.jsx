import { useEffect, useState } from "react";
import ContactSection from "./components/ContactSection.jsx";
import FacilitiesSection from "./components/FacilitiesSection.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import HeroSection from "./components/HeroSection.jsx";
import MembershipCta from "./components/MembershipCta.jsx";
import OfferSection from "./components/OfferSection.jsx";
import PricingSection from "./components/PricingSection.jsx";
import TrainerSection from "./components/TrainerSection.jsx";
import WhyChooseUs from "./components/WhyChooseUs.jsx";

export default function App() {
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    const updateHeaderVisibility = () => {
      const hero = document.getElementById("home");

      if (!hero) {
        setShowHeader(true);
        return;
      }

      setShowHeader(hero.getBoundingClientRect().bottom <= 0);
    };

    updateHeaderVisibility();
    window.addEventListener("scroll", updateHeaderVisibility, { passive: true });
    window.addEventListener("resize", updateHeaderVisibility);

    return () => {
      window.removeEventListener("scroll", updateHeaderVisibility);
      window.removeEventListener("resize", updateHeaderVisibility);
    };
  }, []);

  return (
    <>
      <HeroSection />
      <Header className={showHeader ? "site-header-visible" : "site-header-hidden"} />
      <main>
        <FacilitiesSection />
        <WhyChooseUs />
        <PricingSection />
        <OfferSection />
        <TrainerSection />
        <MembershipCta />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
