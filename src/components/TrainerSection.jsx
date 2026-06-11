import { motion } from "framer-motion";
import { trainers } from "../data/siteData.jsx";
import { fadeUp } from "./animations.js";
import SectionIntro from "./SectionIntro.jsx";

export default function TrainerSection() {
  return (
    <section className="section light">
      <div className="container">
        <SectionIntro
          kicker="Coaches"
          title="Specialists who guide your progress."
          text="Training, nutrition, rehab, and physio support for every stage of your fitness journey."
        />
        <div className="trainer-feature-grid">
          {trainers.map((trainer) => (
            <motion.div 
              className="trainer-feature" 
              key={trainer.name}
              variants={fadeUp} 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <div className="trainer-feature-content">
                <div>
                  <p className="trainer-role">{trainer.role}</p>
                  <h3>{trainer.name}</h3>
                  <div className="trainer-detail-list">
                    <p>
                      <span>Experience</span>
                      <strong>{trainer.experience}</strong>
                    </p>
                    <p>
                      <span>Specialty</span>
                      <strong>{trainer.specialty}</strong>
                    </p>
                    <p>
                      <span>Focus</span>
                      <strong>{trainer.focus}</strong>
                    </p>
                  </div>
                </div>
                <a className="btn primary small" href="#contact">Meet the team</a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
