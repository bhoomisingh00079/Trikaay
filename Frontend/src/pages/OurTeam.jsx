import { Link } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt, FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import styles from "./OurTeam.module.css";

const teamMembers = [
  {
    name: "Shilpa Bambarkar",
    role: "Director",
    image: "https://trikay.org/admin/upload/2110230607244.png",
  },
  {
    name: "Mr. Jayesh Bambarkar",
    role: "Director",
    image: "https://trikay.org/admin/upload/301023033946Untitled%20design.png",
  },
  {
    name: "Mr. Dinesh Mishra",
    role: "Founder",
    image: "https://trikay.org/admin/upload/2110230606323.png",
  },
  {
    name: "Adv. Roshani Thakur",
    role: "Legal Advisor",
    image:
      "https://trikay.org/admin/upload/2212230333068015bbcd-1f63-4025-9075-c60327f1b902.jpeg",
  },
  {
    name: "Mrs. Snehal Jadhav",
    role: "Counsellor",
    image: "https://trikay.org/admin/upload/2110230606422.png",
  },
  {
    name: "Mrs. Shweta Damle",
    role: "Our Mentor",
    image: "https://trikay.org/admin/upload/251023045307Untitled%20design%20(2).png",
  },
  {
    name: "Mr. Santosh Shinde",
    role: "Our Mentor",
    image: "https://trikay.org/admin/upload/251023045319Untitled%20design%20(1).png",
  },
  {
    name: "Porav Enterprises",
    role: "Web Developer Partner",
    image: "https://trikay.org/admin/upload/2110230606526.png",
  },
  {
    name: "Professional Utilities Company",
    role: "Legal & Compliance Partner",
    image: "https://trikay.org/admin/upload/2110230616395.png",
  },
];

export default function OurTeam() {
  const firstRow = teamMembers.slice(0, 5);
  const secondRow = teamMembers.slice(5);

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <Link to="/" className={styles.logoLink}>
          <span className={styles.logoMark}>TC</span>
          <span className={styles.logoText}>Trikay Care and Creation Association</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={`${styles.navLink} ${styles.activePill}`}>
            Home
          </Link>

          <div className={styles.dropdown}>
            <button type="button" className={styles.navButton}>
              Our Organization <FiChevronDown />
            </button>
            <div className={styles.dropdownMenu}>
              <Link to="/about">About Us</Link>
              <Link to="/our-team">Our Team</Link>
            </div>
          </div>

          <Link to="/support" className={styles.navLink}>
            Support Us
          </Link>
          <Link to="/blogs" className={styles.navLink}>
            Blogs
          </Link>
          <Link to="/contact" className={styles.navLink}>
            Contact Us
          </Link>
        </nav>
      </header>

      <section className={styles.banner}>
        <h1 className={styles.bannerTitle}>Our Team</h1>
      </section>

      <section className={styles.teamSection}>
        <div className={styles.teamGrid}>
          {firstRow.map((member) => (
            <article className={styles.card} key={member.name}>
              <img
                src={member.image}
                alt={member.name}
                className={styles.cardImage}
                loading="lazy"
              />
              <h2 className={styles.cardName}>{member.name}</h2>
              <p className={styles.cardRole}>{member.role}</p>
            </article>
          ))}
        </div>

        <div className={styles.teamGrid}>
          {secondRow.map((member) => (
            <article className={styles.card} key={member.name}>
              <img
                src={member.image}
                alt={member.name}
                className={styles.cardImage}
                loading="lazy"
              />
              <h2 className={styles.cardName}>{member.name}</h2>
              <p className={styles.cardRole}>{member.role}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div>
            <div className={styles.footerLogoWrap}>
              <span className={styles.logoMark}>TC</span>
              <p className={styles.footerBrandTitle}>Trikay Care and Creation Association</p>
            </div>

            <div className={styles.iconButtons}>
              <a href="mailto:info@trikay.org" aria-label="Email">
                <MdEmail />
              </a>
              <a href="tel:+919999999999" aria-label="Phone">
                <FaPhoneAlt />
              </a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3>Navigation</h3>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/blogs">Blogs</Link>
            <Link to="/support">Become Volunteer</Link>
            <Link to="/contact">Contact Us</Link>
          </div>

          <div className={styles.footerColumn}>
            <h3>Office Hours</h3>
            <p>Monday to Friday 10:00 a.m to 6:00 p.m</p>
            <p>Sunday Closed</p>
          </div>

          <div className={styles.footerColumn}>
            <h3>Newsletter</h3>
            <div className={styles.newsletter}>
              <input type="email" placeholder="Your email" aria-label="Email address" />
              <button type="button">Subscribe</button>
            </div>
          </div>
        </div>

        <div className={styles.footerSocialRight}>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>Copyright @2023 Trikay. All Rights Reserved</p>
          <div className={styles.bottomLinks}>
            <Link to="/contact">Contact Us</Link>
            <span>|</span>
            <Link to="/support">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
