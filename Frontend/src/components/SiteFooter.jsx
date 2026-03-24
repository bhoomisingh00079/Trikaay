import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

export default function SiteFooter({ showVolunteer = false }) {
  const linkClasses = "text-base text-slate-800 transition hover:text-blue-600";

  return (
    <footer>
      {showVolunteer && (
        <section className="flex justify-center bg-violet-300 py-14">
          <div className="flex w-full max-w-5xl flex-col items-center justify-between gap-10 px-6 text-center md:flex-row md:text-left">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold text-slate-900">
                Together, we can change the world.
              </h2>
              <p className="mt-2 text-lg text-slate-800">Join our mission as a volunteer today</p>
            </div>

            <button className="rounded-full bg-blue-600 px-6 py-3 text-lg font-medium text-white transition hover:scale-105 hover:bg-blue-700 hover:shadow-lg">
              Become a Volunteer
            </button>
          </div>
        </section>
      )}

      <section className="flex justify-center bg-violet-200 py-12">
        <div className="flex w-full max-w-4xl flex-col items-center justify-between gap-6 px-6 md:flex-row md:items-start">
          <div className="flex flex-col gap-5">
            <h2 className="text-4xl font-bold text-slate-900">TCCA</h2>

            <div className="flex flex-wrap gap-4">
              <Link to="/" className={linkClasses}>
                🏠 Home
              </Link>
              <Link to="/about" className={linkClasses}>
                📘 About Us
              </Link>
              <Link to="/blogs" className={linkClasses}>
                📰 Blogs
              </Link>
              <Link to="/support" className={linkClasses}>
                🤝 Become Volunteer
              </Link>
              <Link to="/contact" className={linkClasses}>
                📞 Contact Us
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="text-center text-base text-slate-800 md:text-right">
              <p className="whitespace-nowrap">🕒 Monday to Friday: 10.00 a.m to 6.00 p.m</p>
              <p className="mt-1">🚫 Sunday: Closed</p>
            </div>

            <div className="flex items-center">
              <input
                placeholder="Your email..."
                className="rounded-l-md border border-slate-300 px-3 py-2 outline-none"
              />
              <button className="rounded-r-md bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex w-full items-center justify-center gap-6 border-t border-purple-300 bg-violet-200 px-4 py-6 text-3xl">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noreferrer"
          className="transition duration-300 hover:scale-110 hover:text-blue-700"
        >
          <FaFacebook />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="transition duration-300 hover:scale-110 hover:text-blue-700"
        >
          <FaInstagram />
        </a>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noreferrer"
          className="transition duration-300 hover:scale-110 hover:text-blue-700"
        >
          <FaYoutube />
        </a>
      </div>

      <div className="bg-black py-4 text-center text-white">
        Copyright ©2023 Trikay | All Rights Reserved
      </div>
    </footer>
  );
}