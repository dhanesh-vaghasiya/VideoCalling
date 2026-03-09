import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar({ user, initials, onOpenModal, onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/profile", label: "My Profile" },
    { to: "/about", label: "About Us" },
    { to: "/doctors", label: "Doctors" },
  ];

  return (
    <nav className="dash-navbar">
      <div className="dash-navbar-inner">
        {/* Brand */}
        <Link to="/dashboard" className="dash-navbar-brand">
          <span className="dash-navbar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L12 22" /><path d="M2 12L22 12" />
            </svg>
          </span>
          <span className="dash-navbar-brand-text">
            Nova Super<br /><span>Specialist Hospital</span>
          </span>
        </Link>

        {/* Center nav links (desktop) */}
        <div className="dash-navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`dash-navbar-link ${location.pathname === link.to ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="dash-navbar-right">
          <button className="dash-navbar-logout" onClick={onLogout} title="Log out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>

          {/* Hamburger button (mobile only) */}
          <button
            className={`dash-hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="dash-hamburger-line" />
            <span className="dash-hamburger-line" />
            <span className="dash-hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && <div className="dash-mobile-overlay" onClick={() => setMenuOpen(false)} />}

      {/* Mobile slide-down menu */}
      <div className={`dash-mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`dash-mobile-link ${location.pathname === link.to ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <button className="dash-mobile-logout" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
