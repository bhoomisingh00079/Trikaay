import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-violet-400 px-4 py-4 text-white shadow md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold leading-none">TCCA</h1>

        <nav className="flex flex-wrap items-center gap-3 text-sm md:gap-5 md:text-base">
          <Link
            to="/"
            className="rounded-full bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            Home
          </Link>

          <div className="group relative">
            <Link to="/about" className="font-medium hover:text-violet-100">
              Our Organization
            </Link>

            <div className="invisible absolute left-0 top-full z-50 mt-2 w-56 rounded-xl bg-white p-2 opacity-0 shadow-[0_12px_24px_rgba(15,23,42,0.14)] transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <Link
                to="/about"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700"
              >
                About Organization
              </Link>
              <Link
                to="/our-team"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700"
              >
                Our Team
              </Link>
              <Link
                to="/beneficiary-portfolio"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700"
              >
                Beneficiary Portfolio
              </Link>
            </div>
          </div>

          <Link to="/support" className="font-medium hover:text-violet-100">
            Support Us
          </Link>
          <Link to="/blogs" className="font-medium hover:text-violet-100">
            Blogs
          </Link>
          <Link to="/contact" className="font-medium hover:text-violet-100">
            Contact Us
          </Link>
          <Link to="/impact" className="font-medium hover:text-violet-100">
            Impact Report
          </Link>
        </nav>
      </div>
    </header>
  );
}