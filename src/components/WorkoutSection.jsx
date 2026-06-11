import { motion } from "framer-motion";
import { commonIcons } from "../data/siteData.jsx";
import { fadeUp, stagger } from "./animations.js";

export default function WorkoutSection({ workout, index }) {
  const { Dumbbell } = commonIcons;
  const mediaVariant =
    workout.layout === "left"
      ? { hidden: { opacity: 0, x: -70, scale: 0.96 }, show: { opacity: 1, x: 0, scale: 1 } }
      : { hidden: { opacity: 0, x: 70, scale: 0.94 }, show: { opacity: 1, x: 0, scale: 1 } };

  return (
    <section id={index === 0 ? "workouts" : undefined} className={`workout-section ${workout.parallax ? "parallax-row" : ""}`}>
      <div className={`container workout-grid ${workout.layout === "right" ? "reverse" : ""}`}>
        <motion.div
          className={`workout-media ${workout.glow ? "with-glow" : ""}`}
          variants={mediaVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        >
          {workout.energetic && <span className="motion-lines" />}
          <img src={workout.image} alt={`${workout.title} training`} />
        </motion.div>
        <motion.div className="workout-copy" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
          <motion.p className="section-kicker" variants={fadeUp}>
            Workout / 0{index + 1}
          </motion.p>
          <motion.h2 variants={fadeUp}>{workout.title}</motion.h2>
          <motion.p className="section-lead" variants={fadeUp}>
            {workout.subtitle}
          </motion.p>
          <motion.div className="exercise-grid" variants={stagger}>
            {workout.exercises.map((exercise) => (
              <motion.div className="exercise-card" key={exercise} variants={fadeUp} whileHover={{ y: -7, scale: 1.02 }}>
                <Dumbbell size={19} />
                <span>{exercise}</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.p className="animation-note" variants={fadeUp}>
            {workout.animation}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
