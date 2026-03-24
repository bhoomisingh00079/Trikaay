import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

export default function SiteFooter({ showVolunteer = false }) {
  return (
    <>
      {showVolunteer && (
        <div className="volunteer">
          <div className="volunteer-inner">
            <div className="volunteer-text">
              <h2>Together, we can change the world.</h2>
              <p>Join our mission as a volunteer today</p>
            </div>

            <button className="home-btn">Become a Volunteer</button>
          </div>
        </div>
      )}

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