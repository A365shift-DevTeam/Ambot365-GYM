import { motion } from "framer-motion";
import { facilities } from "../data/siteData.jsx";
import { fadeUp, stagger } from "./animations.js";
import SectionIntro from "./SectionIntro.jsx";

function FacilityCard({ title, Icon, index }) {
  return (
    <motion.div className="facility-card" variants={fadeUp}>
      <span className="facility-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="icon-wrap">
        <Icon size={20} />
      </span>
      <h3>{title}</h3>
    </motion.div>
  );
}

export default function FacilitiesSection() {
  return (
    <section id="facilities" className="section light">
      <div className="container">
        <SectionIntro
          kicker="Facilities"
          title="Everything you need to train well."
          text="Premium equipment, coached sessions, group energy, and recovery support in one clean fitness space."
        />
        <motion.div className="facility-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {facilities.map(([title, Icon], index) => (
            <FacilityCard key={title} title={title} Icon={Icon} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
