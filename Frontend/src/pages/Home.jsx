import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ✅ MAIN CONTENT WRAPPER */}
      <div className="main-content">
        {/* FEATURES */}
        <div className="features">
          <div className="card">
            <img src={img1} className="card-img" />
            <p>
              <b>Dreams Without Limits —</b>
              <br />
              Supporting the next generation of female leaders and innovators
              through education.
            </p>
          </div>

          <div className="card">
            <img src={img2} className="card-img" />
            <p>
              <b>Direct Impact Support —</b>
              <br />
              Transparency is our priority:
              <br />
              every rupee donated goes
              <br />
              straight to community upliftment and essential resources.
            </p>
          </div>

          <div className="card">
            <img src={img3} className="card-img" />
            <p>
              <b>Social Transformation —</b>
              <br />
              Showcasing the measurable progress
              <br />
              of our initiatives in creating a more
              <br />
              equitable society for all.
            </p>
          </div>
        </div>

        {/* ABOUT */}
        <div className="about">
          <div className="about-header">
            <div>
              <h1 className="about-title">About Us</h1>
              <h2 className="about-subtitle">We are work in India</h2>
            </div>

            <button className="home-btn">Read More</button>
          </div>

          <p className="about-text">
            Trikay Care and Creation Association is registered under section 8
            of the Companies Act, 2013. It is a non-profit organization
            dedicated to creating positive change in the Raigad District of
            Maharashtra. We focus on childcare, education, health, employment,
            finance, and livelihood awareness programs.
          </p>
        </div>

        {/* STATS */}
        <div className="stats">
          <div className="stat-box">
            <span className="stat-icon">😊</span>
            <h2>754</h2>
            <p>Global Supporters</p>
          </div>

          <div className="stat-box">
            <span className="stat-icon">🚀</span>
            <h2>675</h2>
            <p>Successful Missions</p>
          </div>

          <div className="stat-box">
            <span className="stat-icon">👤</span>
            <h2>1248</h2>
            <p>Dedicated Volunteers</p>
          </div>

          <div className="stat-box">
            <span className="stat-icon">🌍</span>
            <h2>24</h2>
            <p>Cities Impacted</p>
          </div>
        </div>

        {/* MISSION */}
        <div className="mission">
          <h1 className="mission-title">OUR SHARED MISSION</h1>

          <h2 className="mission-subtitle">
            Compassion in Action:{" "}
            <span className="mission-light">Changing Lives Every Day! ✨</span>
          </h2>

          <p className="mission-quote">
            “If you knew what I know about the power of giving, you would not
            let a single meal pass without sharing it in some way.”
          </p>

          <button className="home-btn">Donate Now!</button>
        </div>

        {/* CONTACT + TESTIMONIAL */}
        <div className="contact-section">
          <div className="contact-left">
            <h2 className="contact-title">Get In Touch Now!</h2>

            <input placeholder="Your Name..." className="input" />
            <input placeholder="Your Phone No..." className="input" />
            <input placeholder="Your Email..." className="input" />
            <input placeholder="Subject..." className="input" />

            <button className="home-btn">Submit</button>
          </div>

          <div className="testimonial">
            <h2 className="contact-title">Client Testimonials</h2>

            <p className="testimonial-text">
              “This NGO is a true force for positive change. Their dedication to
              make a difference in the world is really inspiring. Support their
              impactful work today!”
            </p>

            <p className="testimonial-name">Pritam Singh</p>
            <p className="testimonial-location">- Mumbai</p>
          </div>
        </div>

      </div>

      <SiteFooter showVolunteer />
    </>
  );
}
