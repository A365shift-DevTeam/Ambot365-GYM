import { brand, footerIcons, navItems, pricing } from "../data/siteData.jsx";

function FooterColumn({ title, items }) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>
      {items.map((item) => (
        <a href={item === "Pricing" ? "#pricing" : "#home"} key={item}>
          {item}
        </a>
      ))}
    </div>
  );
}

export default function Footer() {
  const { Camera, Mail, Phone } = footerIcons;

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <a className="logo footer-logo" href="#home">
            <span className="logo-mark">AG</span>
            <span>
              <strong>{brand.fullName}</strong>
              <small>{brand.tagline}</small>
            </span>
          </a>
          <p>{brand.address}</p>
          <div className="socials" aria-label="Social media links">
            <a href="#home" aria-label="Instagram">
              <Camera size={19} />
            </a>
            <a href="#contact" aria-label="Phone">
              <Phone size={19} />
            </a>
            <a href="#contact" aria-label="Email">
              <Mail size={19} />
            </a>
          </div>
        </div>
        <FooterColumn title="Quick Links" items={navItems} />
        <FooterColumn title="Membership Plans" items={pricing.map((item) => item.title)} />
      </div>
      <div className="container copyright">© 2026 {brand.fullName}. All rights reserved.</div>
    </footer>
  );
}
