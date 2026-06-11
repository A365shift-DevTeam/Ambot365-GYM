import { motion } from "framer-motion";
import { pricing } from "../data/siteData.jsx";
import { fadeUp, stagger } from "./animations.js";
import SectionIntro from "./SectionIntro.jsx";

function PricingCard({ plan }) {
  return (
    <motion.article className={`pricing-card ${plan.featured ? "featured" : ""}`} variants={fadeUp} whileHover={{ y: -10 }}>
      {plan.featured && <div className="plan-badge">Most Popular</div>}
      <h3>{plan.title}</h3>
      <div className="price-list">
        {plan.items.map(([label, price]) => (
          <div key={`${plan.title}-${label}`}>
            <span>{label}</span>
            <strong>{price}</strong>
          </div>
        ))}
      </div>
      <a className={`btn ${plan.featured ? "primary" : "secondary"} small`} href="#contact">
        Enroll Now
      </a>
    </motion.article>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="section light pricing-section">
      <div className="container">
        <SectionIntro
          kicker="Plans"
          title="Simple membership options."
          text="Choose gym access, diet support, transformation coaching, or personal training."
        />
        <motion.div className="pricing-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {pricing.map((plan) => (
            <PricingCard key={plan.title} plan={plan} />
          ))}
        </motion.div>
        <p className="terms">Terms & conditions apply.</p>
      </div>
    </section>
  );
}
