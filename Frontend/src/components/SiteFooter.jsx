import { Link } from "react-router-dom";
import { useState } from "react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

export default function SiteFooter({ showVolunteer = false }) {
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState({ type: '', message: '' });
  const linkClasses = "text-base text-slate-800 transition hover:text-blue-600";

  const handleScrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribeStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:5001/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail }),
      });

      if (response.ok) {
        setSubscribeStatus({ type: 'success', message: 'Thank you for subscribing!' });
        setSubscribeEmail('');
      } else {
        const error = await response.json();
        setSubscribeStatus({ type: 'error', message: error.error || 'Subscription failed' });
      }
    } catch (error) {
      setSubscribeStatus({ type: 'error', message: 'Network error. Please try again.' });
      console.error('Subscribe error:', error);
    }
  };

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

            <Link
              to="/volunteers"
              className="rounded-full bg-blue-600 px-6 py-3 text-lg font-medium text-white transition hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
            >
              Become a Volunteer
            </Link>
          </div>
        </section>
      )}

      <section className="flex justify-center bg-violet-200 py-8">
        <div className="flex w-full max-w-4xl flex-col items-center justify-between gap-4 px-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img
                src="/images/LOGO.jpeg"
                alt="Trikay Care And Creation Association logo"
                className="h-10 w-auto"
              />
              <span className="text-lg font-bold text-slate-900">Trikay Care And Creation Association</span>
            </div>
            <div className="text-sm text-slate-800">
              <p>Monday-Friday: 10 AM - 6 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <form onSubmit={handleSubscribe} className="flex w-full flex-col items-center gap-2">
              <div className="flex items-center w-full">
                <input
                  type="email"
                  placeholder="Your email..."
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  className="rounded-l-md border border-slate-300 px-3 py-2 text-sm outline-none flex-1"
                  required
                />
                <button type="submit" className="rounded-r-md bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700">
                  Subscribe
                </button>
              </div>
              {subscribeStatus.message && (
                <div className={`text-xs font-medium p-2 rounded w-full text-center ${
                  subscribeStatus.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscribeStatus.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <div className="flex w-full items-center justify-center gap-6 border-t border-purple-300 bg-violet-200 px-4 py-3 text-2xl">
        <a
          href=""
          target="_blank"
          rel="noreferrer"
          className="transition duration-300 hover:scale-110 hover:text-blue-700"
        >
          <FaFacebook />
        </a>
        <a
          href=""
          target="_blank"
          rel="noreferrer"
          className="transition duration-300 hover:scale-110 hover:text-blue-700"
        >
          <FaInstagram />
        </a>
        <a
          href=""
          target="_blank"
          rel="noreferrer"
          className="transition duration-300 hover:scale-110 hover:text-blue-700"
        >
          <FaYoutube />
        </a>
      </div>

      <div className="bg-black py-3 text-center text-sm text-white">
        Copyright ©2026 Trikay | All Rights Reserved
      </div>
    </footer>
  );
}