import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { brand, navItems } from "../data/siteData.jsx";

export default function Header({ className = "" }) {
  return (
    <motion.header
      className={`site-header ${className}`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <a className="logo" href="#home" aria-label="Fitness Factory home">
        <span className="logo-mark">FF</span>
        <span>
          <strong>{brand.name}</strong>
          <small>K.K. Nagar</small>
        </span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`}>
            {item}
          </a>
        ))}
      </nav>
      <button className="mobile-menu" aria-label="Open menu">
        <Menu size={22} />
      </button>
    </motion.header>
  );
}
