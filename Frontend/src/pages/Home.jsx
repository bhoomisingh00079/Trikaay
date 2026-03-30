import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import { apiUrl, mediaFileUrl } from "../utils/api";

const fallbackStatsData = [
  { icon: "😊", value: 754, label: "Global Supporters" },
  { icon: "🚀", value: 675, label: "Successful Missions" },
  { icon: "👤", value: 1248, label: "Dedicated Volunteers" },
  { icon: "🌍", value: 24, label: "Cities Impacted" },
];

const statIcons = ["😊", "🚀", "👤", "🌍"];

export default function Home() {
  const animationRef = useRef(null);
  const [statsData, setStatsData] = useState(fallbackStatsData);
  const [counters, setCounters] = useState(fallbackStatsData.map(() => 0));
  const homeCardImages = {
    education: mediaFileUrl("img1.jpg"),
    impact: mediaFileUrl("img2.jpg"),
    transformation: mediaFileUrl("img3.jpg"),
  };
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
  });
  const [contactStatus, setContactStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const targets = statsData.map((item) => {
      const num = Number(item.value);
      return Number.isFinite(num) ? num : 0;
    });

    const duration = 1200;
    const startTime = performance.now();

    setCounters(targets.map(() => 0));

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounters(targets.map((target) => Math.round(target * eased)));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [statsData]);

  const buttonClasses =
    "rounded-full bg-blue-600 px-6 py-2 font-medium text-brand-inverse transition hover:scale-105 hover:bg-blue-700 hover:shadow-lg";

  const inputClasses = "w-full rounded border border-slate-300 p-3 text-base";

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ type: "", message: "" });

    try {
      const response = await fetch(apiUrl('/api/contact'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setContactStatus({
          type: "success",
          message: "Thank you! Your message has been sent.",
        });
        setContactForm({
          name: "",
          phone: "",
          email: "",
          subject: "",
        });
      } else {
        const error = await response.json();
        setContactStatus({
          type: "error",
          message: error.error || "Failed to send message",
        });
      }
    } catch (error) {
      setContactStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
      console.error("Contact form error:", error);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-3.5rem)] support-bg px-4 py-8 text-brand-primary sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="mb-4">
          <h1 className="heading-display">
            Introduction to Trikay Care & Creation Association
          </h1>
        </div>

        <p className="body-copy mt-4 text-lg">
          Trikay Care & Creation Association is a non-profit organization
          dedicated to providing aftercare services to girls aged 18 to 25 in
          Raigad district, Maharashtra. With a strong commitment to empowering
          and supporting these young women, Trikay Care & Creation Association
          aims to address the unique challenges they face in their transition
          into adulthood. This article explores the importance of aftercare for
          girls in Raigad district, the specific challenges they encounter, and
          the various services and support provided by Trikay Care & Creation
          Association.
        </p>
        <div className="text-lg leading-7">
          {/* Cards */}
          <section className="mt-[-10px] grid gap-8 px-6 pb-10 pt-10 text-center md:grid-cols-3">
            <article className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-md">
              <img src={homeCardImages.education} alt="Education support" className="h-64 w-48 rounded-xl object-cover shadow-md transition duration-300 hover:scale-105" loading="lazy" />
              <p>
                <b>Dreams Without Limits —</b>
                <br />
                Supporting the next generation of female leaders and innovators
                through education.
              </p>
            </article>

            <article className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-md">
              <img src={homeCardImages.impact} alt="Direct impact support" className="h-64 w-48 rounded-xl object-cover shadow-md transition duration-300 hover:scale-105" loading="lazy" />
              <p>
                <b>Direct Impact Support —</b>
                <br />
                Transparency is our priority:
                <br />
                every rupee donated goes
                <br />
                straight to community upliftment and essential resources.
              </p>
            </article>

            <article className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-md">
              <img src={homeCardImages.transformation} alt="Social transformation" className="h-64 w-48 rounded-xl object-cover shadow-md transition duration-300 hover:scale-105" loading="lazy" />
              <p>
                <b>Social Transformation —</b>
                <br />
                Showcasing the measurable progress
                <br />
                of our initiatives in creating a more
                <br />
                equitable society for all.
              </p>
            </article>
          </section>

          {/* Stats */}
          <section
            className="grid grid-cols-2 gap-6 bg-purple-300 py-2 text-center md:grid-cols-4"
          >
            {statsData.map((item, index) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-4xl">{item.icon}</span>
                <h2 className="text-brand-heading">
                  <span
                    data-animation-duration="2000"
                    data-value={item.value}
                    className="inline-block min-w-[4ch] text-5xl font-extrabold leading-none transition-all duration-300"
                  >
                    {counters[index]}
                  </span>
                </h2>
                <p className="text-base text-brand-primary">{item.label}</p>
              </div>
            ))}
          </section>

          {/* Contact */}
          <section className="px-10 py-16">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              <h2 className="mb-2 text-2xl font-bold text-brand-heading">Get In Touch Now!</h2>
              <form
                onSubmit={handleContactSubmit}
                className="flex flex-col gap-4"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name..."
                  value={contactForm.name}
                  onChange={handleContactChange}
                  className={inputClasses}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone No..."
                  value={contactForm.phone}
                  onChange={handleContactChange}
                  className={inputClasses}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email..."
                  value={contactForm.email}
                  onChange={handleContactChange}
                  className={inputClasses}
                  required
                />
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject..."
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  className={inputClasses}
                  required
                />
                <button type="submit" className={buttonClasses}>
                  Submit
                </button>
                {contactStatus.message && (
                  <div
                    className={`rounded p-3 text-sm font-medium ${
                      contactStatus.type === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {contactStatus.message}
                  </div>
                )}
              </form>
            </div>
            
          </section>

          <section className="mt-[-20px] flex flex-col items-center gap-5 px-6 py-16 text-center">
            <h1 className="heading-section">OUR SHARED MISSION</h1>
            <h2 className="text-2xl font-semibold text-brand-heading">
              Compassion in Action:{" "}
              <span className="font-medium text-green-700">
                Changing Lives Every Day!
              </span>
            </h2>
            <p className="body-copy mt-2 max-w-2xl">
              "If you knew what I know about the power of giving, you would not
              let a single meal pass without sharing it in some way."
            </p>
            <button
              onClick={() => (window.location.href = "/support")}
              className={buttonClasses}
            >
              Donate Now!
            </button>
          </section>
        </div>
      </main>

      <SiteFooter showVolunteer />
    </>
  );
}
