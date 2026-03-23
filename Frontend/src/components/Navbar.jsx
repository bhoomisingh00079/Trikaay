import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar">
      <h1 className="logo">TCCA</h1>

      <div className="nav-links">
        <Link to="/" className="home-btn">Home</Link>

        <div className="nav-dropdown">
          <Link to="/about" className="nav-dropdown-toggle">Our Organization</Link>

          <div className="nav-dropdown-menu">
            <Link to="/about">About Organization</Link>
            <Link to="/our-team">Our Team</Link>
            <Link to="/beneficiary-portfolio">Beneficiary Portfolio</Link>
          </div>
        </div>

        <Link to="/support">Support Us</Link>
        <Link to="/blogs">Blogs</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/impact">Impact Report</Link>
      </div>
    </div>
  );
}