import Navbar from './Navbar';
import SiteFooter from './SiteFooter';

export default function PageLoader() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mb-4 inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
          <p className="text-slate-600">Loading page...</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
