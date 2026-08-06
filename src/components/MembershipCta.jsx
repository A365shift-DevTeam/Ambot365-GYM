import { motion } from "framer-motion";

export default function MembershipCta() {
  return (
    <section className="membership-cta">
      <motion.div className="container cta-panel" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div>
          <p className="section-kicker">Enroll Now</p>
          <h2>Start Your Fitness Journey Today!</h2>
          <p>
            Join Ambot365 Gym and transform your body with expert training, premium equipment, and
            personalized fitness plans.
          </p>
        </div>
        <a className="btn primary" href="#contact">
          Enroll Now
        </a>
      </motion.div>
    </section>
  );
}
