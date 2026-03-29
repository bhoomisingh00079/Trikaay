import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SiteFooter from '../components/SiteFooter';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <h1 className="mb-4 text-9xl font-bold text-blue-600">404</h1>
            <h2 className="mb-2 text-3xl font-bold text-slate-900">Page Not Found</h2>
            <p className="text-lg text-slate-600">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="mb-8 space-y-3">
            <Link
              to="/"
              className="block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Go to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="block w-full rounded-lg border-2 border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Go Back
            </button>
          </div>

          <div className="mt-12 rounded-lg bg-blue-50 p-6">
            <p className="mb-4 text-sm font-medium text-slate-700">Quick Links</p>
            <nav className="space-y-2 text-sm">
              <Link to="/about" className="block text-blue-600 hover:underline">
                About Us
              </Link>
              <Link to="/what-we-do" className="block text-blue-600 hover:underline">
                What We Do
              </Link>
              <Link to="/contact" className="block text-blue-600 hover:underline">
                Contact
              </Link>
              <Link to="/support" className="block text-blue-600 hover:underline">
                Support Us
              </Link>
            </nav>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
