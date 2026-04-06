import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaLock, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import { mediaFileUrl } from "../utils/api";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 0);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={`navbar-header sticky top-0 z-[1001] bg-gradient-to-br from-[#6b3fa0] to-[#9b59b6] px-4 md:px-10 transition-shadow duration-300 ${
        isScrolled ? "navbar-scrolled" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src={mediaFileUrl("LOGO.jpeg")}
            alt="Trikay Care And Creation Association logo"
            className="h-10 w-auto"
            loading="lazy"
          />
          <span className="sr-only">Trikay Care And Creation Association</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link--active" : ""}`
            }
          >
            Home
          </NavLink>

          <div className="nav-dropdown-group">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link--active" : ""}`
              }
            >
              Our Organization
            </NavLink>

            <div className="nav-dropdown">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? "nav-dropdown-link nav-dropdown-link--active"
                    : "nav-dropdown-link"
                }
              >
                About Organization
              </NavLink>
              <NavLink
                to="/our-team"
                className={({ isActive }) =>
                  isActive
                    ? "nav-dropdown-link nav-dropdown-link--active"
                    : "nav-dropdown-link"
                }
              >
                Our Team
              </NavLink>
              <NavLink
                to="/what-we-do"
                className={({ isActive }) =>
                  isActive
                    ? "nav-dropdown-link nav-dropdown-link--active"
                    : "nav-dropdown-link"
                }
              >
                What We Do
              </NavLink>
            </div>
          </div>

          <NavLink
            to="/support"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link--active" : ""}`
            }
          >
            Support Us
          </NavLink>

          <NavLink
            to="/volunteers"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link--active" : ""}`
            }
          >
            Volunteers
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link--active" : ""}`
            }
          >
            Contact Us
          </NavLink>

          <NavLink
            to="/impact"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link--active" : ""}`
            }
          >
            Impact Report
          </NavLink>

          {/* Login Button */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate('/admin');
              } else {
                setIsModalOpen(true);
              }
            }}
            className="login-btn"
            title={isAuthenticated ? "Go to Admin Panel" : "Admin Login"}
          >
            <FaLock size={16} />
            Login
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-white text-2xl transition-colors duration-200 hover:opacity-80"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <nav
        className={`mobile-menu ${isMobileMenuOpen ? "mobile-menu--open" : ""}`}
      >
        <div className="mobile-menu-content">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "mobile-nav-link--active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "mobile-nav-link--active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            Our Organization
          </NavLink>

          <NavLink
            to="/our-team"
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "mobile-nav-link--active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            Our Team
          </NavLink>

          <NavLink
            to="/what-we-do"
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "mobile-nav-link--active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            What We Do
          </NavLink>

          <NavLink
            to="/support"
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "mobile-nav-link--active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            Support Us
          </NavLink>

          <NavLink
            to="/volunteers"
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "mobile-nav-link--active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            Volunteers
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "mobile-nav-link--active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            Contact Us
          </NavLink>

          <NavLink
            to="/impact"
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "mobile-nav-link--active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            Impact Report
          </NavLink>

          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate('/admin');
              } else {
                setIsModalOpen(true);
              }
              closeMobileMenu();
            }}
            className="login-btn w-full justify-center mt-2"
            title={isAuthenticated ? "Go to Admin Panel" : "Admin Login"}
          >
            <FaLock size={16} />
            Login
          </button>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}