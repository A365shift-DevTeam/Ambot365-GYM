import { motion } from "framer-motion";
import { brand, contactIcons } from "../data/siteData.jsx";

export default function ContactSection() {
  const { Mail, MapPin, Phone } = contactIcons;

  return (
    <section id="contact" className="section contact-section">
      <div className="container contact-grid">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="section-kicker">Contact</p>
          <h2>Visit Ambot365 Gym</h2>
          <p className="section-lead">{brand.address}</p>
          <div className="contact-lines">
            <p>
              <Phone size={18} /> {brand.phones.join(" / ")}
            </p>
            <p>
              <MapPin size={18} /> K.K. Nagar, Chennai
            </p>
            <p>
              <Mail size={18} /> Start your fitness journey with us today.
            </p>
          </div>
        </motion.div>
        <motion.form className="contact-form" initial={{ opacity: 0, y: 38 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <input placeholder="Name" aria-label="Name" />
          <input placeholder="Phone Number" aria-label="Phone Number" />
          <input type="email" placeholder="Email" aria-label="Email" />
          <input placeholder="Fitness Goal" aria-label="Fitness Goal" />
          <select aria-label="Preferred Package" defaultValue="">
            <option value="" disabled>
              Preferred Package
            </option>
            <option>Membership</option>
            <option>Membership + Diet</option>
            <option>Transformation Package</option>
            <option>Personal Training + Diet</option>
          </select>
          <textarea placeholder="Message" aria-label="Message" rows="5" />
          <button className="btn primary" type="button">
            Start Your Fitness Journey
          </button>
        </motion.form>
      </div>
    </section>
  );
}
