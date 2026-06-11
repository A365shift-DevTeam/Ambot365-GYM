import { motion } from "framer-motion";
import { commonIcons, whyChoose } from "../data/siteData.jsx";
import { fadeUp, stagger } from "./animations.js";
import SectionIntro from "./SectionIntro.jsx";

export default function WhyChooseUs() {
  const { BadgeCheck } = commonIcons;

  return (
    <section id="programs" className="section">
      <div className="container">
        <SectionIntro
          kicker="Why Join"
          title="Focused training. Better support."
          text="A practical gym experience built around coaching, consistency, and measurable transformation."
        />
        <motion.div className="why-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {whyChoose.map((point, index) => (
            <motion.article className="why-card" key={point} variants={fadeUp}>
              <span className="why-index">{String(index + 1).padStart(2, "0")}</span>
              <BadgeCheck />
              <p>{point}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
