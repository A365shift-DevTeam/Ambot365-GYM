import { motion } from "framer-motion";

export default function OfferSection() {
  return (
    <section className="offer-section">
      <motion.div
        className="container offer-card"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75 }}
      >
        <div>
          <p>Pongal Discount</p>
          <h2>Annual Membership ₹9,999</h2>
          <span>Get InBody Analysis Free</span>
        </div>
        <div className="offer-badge">
          <strong>₹1,000 OFF</strong>
          <span>Offer valid till 20th January</span>
        </div>
      </motion.div>
    </section>
  );
}
