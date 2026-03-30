import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { SiFacebook, SiInstagram, SiX, SiYoutube, SiWhatsapp } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { apiUrl, getPublicSiteSettings, mediaFileUrl } from "../utils/api";

export default function SiteFooter({ showVolunteer = false }) {
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState({ type: '', message: '' });
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    whatsapp: '',
  });

  useEffect(() => {
    let mounted = true;

    async function loadSiteSettings() {
      try {
        const response = await getPublicSiteSettings();
        const links = response?.data?.socialLinks || {};

        if (mounted) {
          setSocialLinks((prev) => ({ ...prev, ...links }));
        }
      } catch (error) {
        // Keep placeholders if public settings are unavailable.
      }
    }

    loadSiteSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const socialItems = useMemo(
    () => [
      { key: 'facebook', label: 'Facebook', Icon: SiFacebook, href: socialLinks.facebook },
      { key: 'instagram', label: 'Instagram', Icon: SiInstagram, href: socialLinks.instagram },
      { key: 'linkedin', label: 'LinkedIn', Icon: FaLinkedin, href: socialLinks.linkedin },
      { key: 'twitter', label: 'X (Twitter)', Icon: SiX, href: socialLinks.twitter },
      { key: 'youtube', label: 'YouTube', Icon: SiYoutube, href: socialLinks.youtube },
      { key: 'whatsapp', label: 'WhatsApp', Icon: SiWhatsapp, href: socialLinks.whatsapp },
    ],
    [socialLinks]
  );

  const handleScrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribeStatus({ type: '', message: '' });

    try {
      const response = await fetch(apiUrl('/api/subscribe'), {
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
              <h2 className="text-3xl font-bold text-brand-heading">
                Together, we can change the world.
              </h2>
              <p className="mt-2 text-lg text-brand-primary">Join our mission as a volunteer today</p>
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
                src={mediaFileUrl("LOGO.jpeg")}
                alt="Trikay Care And Creation Association logo"
                className="h-10 w-auto"
                loading="lazy"
              />
              <span className="text-lg font-bold text-brand-heading">Trikay Care And Creation Association</span>
            </div>
            <div className="text-sm text-brand-primary">
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
                  className="flex-1 rounded-l-md border border-slate-300 px-3 py-2 text-sm text-brand-primary outline-none"
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

      <div className="border-t border-purple-300 bg-violet-200 px-4 py-4">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-5 text-3xl">
          {socialItems.map(({ key, label, Icon, href }) => {
            const hasUrl = Boolean((href || '').trim());
            const colorByKey = {
              facebook: 'text-[#1877F2]',
              instagram: 'text-[#E4405F]',
              linkedin: 'text-[#0A66C2]',
              twitter: 'text-[#111827]',
              youtube: 'text-[#FF0000]',
              whatsapp: 'text-[#25D366]',
            };

            const colorClass = colorByKey[key] || 'text-blue-700';

            if (!hasUrl) {
              return (
                <span
                  key={key}
                  title={`${label} link not set yet`}
                  className="cursor-not-allowed opacity-50"
                >
                  <Icon className={colorClass} />
                </span>
              );
            }

            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="transition-transform hover:scale-110"
                title={`Open ${label}`}
                aria-label={label}
              >
                <Icon className={colorClass} />
              </a>
            );
          })}
        </div>
      </div>

      <div className="bg-black py-3 text-center text-sm text-white">
        Copyright ©2026 Trikay | All Rights Reserved
      </div>
    </footer>
  );
}