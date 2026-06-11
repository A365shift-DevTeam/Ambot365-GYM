import { motion } from "framer-motion";
import { fadeUp, stagger } from "./animations.js";

export default function SectionIntro({ kicker, title, text }) {
  return (
    <motion.div className="section-intro" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
      <motion.p className="section-kicker" variants={fadeUp}>
        {kicker}
      </motion.p>
      <motion.h2 variants={fadeUp}>{title}</motion.h2>
      <motion.p className="section-lead" variants={fadeUp}>{text}</motion.p>
    </motion.div>
  );
}
