import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
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
      <Navbar />

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

      <div className="info-section">
        <div className="info-inner">
          <div className="info-left">
            <h2 className="logo">TCCA</h2>

            <div className="info-links">
              <Link to="/">🏠 Home</Link>
              <Link to="/about">📘 About Us</Link>
              <Link to="/blogs">📰 Blogs</Link>
              <Link to="/support">🤝 Become Volunteer</Link>
              <Link to="/contact">📞 Contact Us</Link>
            </div>
          </div>

          <div className="info-right">
            <div className="timing">
              <p>🕒 Monday to Friday: 10.00 a.m to 6.00 p.m</p>
              <p>🚫 Sunday: Closed</p>
            </div>

            <div className="subscribe">
              <input type="email" placeholder="Your email..." className="subscribe-input" />
              <button className="home-btn">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      <div className="socials">
        <a href="https://facebook.com" target="_blank" rel="noreferrer">
          <FaFacebook />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          <FaInstagram />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer">
          <FaYoutube />
        </a>
      </div>

      <div className="footer">Copyright ©2023 Trikay | All Rights Reserved</div>
    </div>
  );
}
