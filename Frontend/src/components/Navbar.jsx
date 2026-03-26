import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-[1001] bg-gradient-to-br from-[#6b3fa0] to-[#9b59b6] px-4 py-2 text-white shadow md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/LOGO.jpeg"
            alt="Trikay Care And Creation Association logo"
            className="h-10 w-auto" 
          />
          <span className="sr-only">Trikay Care And Creation Association</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm md:gap-5 md:text-base">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-blue-700 px-5 py-2 font-medium text-white transition"
                : "rounded-full px-5 py-2 font-medium text-white transition hover:bg-blue-700"
            }
          >
            Home
          </NavLink>

          <div className="group relative">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "rounded-full bg-blue-700 px-5 py-2 font-medium text-white transition"
                  : "rounded-full px-5 py-2 font-medium text-white transition hover:bg-blue-700"
              }
            >
              Our Organization
            </NavLink>

            <div className="invisible absolute left-0 top-full z-[1002] mt-2 w-56 rounded-xl bg-white p-2 opacity-0 shadow-[0_12px_24px_rgba(15,23,42,0.14)] transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? "block rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                    : "block rounded-lg px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700"
                }
              >
                About Organization
              </NavLink>
              <NavLink
                to="/our-team"
                className={({ isActive }) =>
                  isActive
                    ? "block rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                    : "block rounded-lg px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700"
                }
              >
                Our Team
              </NavLink>
              <NavLink
                to="/what-we-do"
                className={({ isActive }) =>
                  isActive
                    ? "block rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                    : "block rounded-lg px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700"
                }
              >
                What We Do
              </NavLink>
            </div>
          </div>

          <NavLink
            to="/support"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-blue-700 px-5 py-2 font-medium text-white transition"
                : "rounded-full px-5 py-2 font-medium text-white transition hover:bg-blue-700"
            }
          >
            Support Us
          </NavLink>
          <NavLink
            to="/volunteers"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-blue-700 px-5 py-2 font-medium text-white transition"
                : "rounded-full px-5 py-2 font-medium text-white transition hover:bg-blue-700"
            }
          >
            Volunteers
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-blue-700 px-5 py-2 font-medium text-white transition"
                : "rounded-full px-5 py-2 font-medium text-white transition hover:bg-blue-700"
            }
          >
            Contact Us
          </NavLink>
          <NavLink
            to="/impact"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-blue-700 px-5 py-2 font-medium text-white transition"
                : "rounded-full px-5 py-2 font-medium text-white transition hover:bg-blue-700"
            }
          >
            Impact Report
          </NavLink>
        </nav>
      </div>
    </header>
  );
}