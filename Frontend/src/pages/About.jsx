import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaBookOpen,
  FaHeartbeat,
  FaRupeeSign,
  FaBriefcase,
  FaUsers,
  FaHandsHelping,
  FaBullhorn,
  FaFacebook,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

const objectiveItems = [
  {
    title: "Safe Housing and Basic Facilities",
    icon: <FaHome />,
  },
  {
    title: "Educational and Vocational Development",
    icon: <FaBookOpen />,
  },
  {
    title: "Physical and Mental Well-being",
    icon: <FaHeartbeat />,
  },
  {
    title: "Life Skills and Financial Literacy",
    icon: <FaRupeeSign />,
  },
  {
    title: "Empowerment and Self-Reliance",
    icon: <FaBriefcase />,
  },
  {
    title: "Social Inclusion and Dignity",
    icon: <FaUsers />,
  },
  {
    title: "Continuous Support and Mentorship",
    icon: <FaHandsHelping />,
  },
  {
    title: "Social Awareness and Community Sensitization",
    icon: <FaBullhorn />,
  },
];

export default function About() {
  return (
    <>
      <Navbar />

      <main className="about-org-page">
        <section className="about-org-card">
          <h1 className="about-org-title">About Us</h1>

          {/* <div className="about-org-tabs" aria-label="About sections">
            <button type="button" className="about-org-tab active">
              Vision
            </button>
            <button type="button" className="about-org-tab">
              Mission
            </button>
            <button type="button" className="about-org-tab">
              Objectives
            </button>
          </div> */}

          <section className="about-org-statement-row">
            <div className="about-org-statement-label">Vision</div>
            <div className="about-org-statement-text">
              To empower every girl who transitions out of institutional care by
              ensuring her access to safety, dignity, and equal opportunities,
              enabling her to become a self-reliant, capable, and confident
              citizen.
            </div>
          </section>

          <section className="about-org-statement-row reverse">
            <div className="about-org-statement-text">
              To create a safe, nurturing, and joyful space for orphaned,
              abandoned, exploited, and neglected girls transitioning out of
              institutional care at 18, empowering them to lead independent,
              dignified lives through education, healthcare, skills training,
              guidance, and ongoing mentorship.
            </div>
            <div className="about-org-statement-label">Mission</div>
          </section>

          <section className="about-org-objectives">
            <h2>Objectives</h2>

            <div className="about-org-wheel">
              <svg className="about-org-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <line x1="50" y1="50" x2="17" y2="17" />
                <line x1="50" y1="50" x2="50" y2="12" />
                <line x1="50" y1="50" x2="83" y2="17" />
                <line x1="50" y1="50" x2="12" y2="50" />
                <line x1="50" y1="50" x2="88" y2="50" />
                <line x1="50" y1="50" x2="17" y2="83" />
                <line x1="50" y1="50" x2="50" y2="88" />
                <line x1="50" y1="50" x2="83" y2="83" />
              </svg>

              <div className="about-org-node n1">
                <span className="about-org-icon">{objectiveItems[0].icon}</span>
                <p>{objectiveItems[0].title}</p>
              </div>
              <div className="about-org-node n2">
                <span className="about-org-icon">{objectiveItems[1].icon}</span>
                <p>{objectiveItems[1].title}</p>
              </div>
              <div className="about-org-node n3">
                <span className="about-org-icon">{objectiveItems[2].icon}</span>
                <p>{objectiveItems[2].title}</p>
              </div>
              <div className="about-org-node n4">
                <span className="about-org-icon">{objectiveItems[3].icon}</span>
                <p>{objectiveItems[3].title}</p>
              </div>
              <div className="about-org-center">Holistic Development</div>
              <div className="about-org-node n5">
                <span className="about-org-icon">{objectiveItems[4].icon}</span>
                <p>{objectiveItems[4].title}</p>
              </div>
              <div className="about-org-node n6">
                <span className="about-org-icon">{objectiveItems[5].icon}</span>
                <p>{objectiveItems[5].title}</p>
              </div>
              <div className="about-org-node n7">
                <span className="about-org-icon">{objectiveItems[6].icon}</span>
                <p>{objectiveItems[6].title}</p>
              </div>
              <div className="about-org-node n8">
                <span className="about-org-icon">{objectiveItems[7].icon}</span>
                <p>{objectiveItems[7].title}</p>
              </div>
            </div>
          </section>
        </section>
      </main>

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
              <input placeholder="Your email..." className="subscribe-input" />
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
    </>
  );
}