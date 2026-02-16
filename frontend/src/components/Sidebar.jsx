import { Link, useLocation } from "react-router-dom";

function Sidebar({ onOpenModal, onLogout }) {
  const location = useLocation();

  return (
    <aside className="dash-sidebar">
      <div className="dash-brand">
        <span className="dash-brand-icon">+</span>
        <span className="dash-brand-text">MedConnect</span>
      </div>

      <nav className="dash-nav">
        <Link
          to="/dashboard"
          className={`dash-nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Dashboard
        </Link>
        <Link
          to="/profile"
          className={`dash-nav-item ${location.pathname === "/profile" ? "active" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          My Profile
        </Link>
        <a href="#" className="dash-nav-item" onClick={(e) => { e.preventDefault(); onOpenModal(); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Book Appointment
        </a>
      </nav>

      <div className="dash-sidebar-footer">
        <button className="dash-logout-btn" onClick={onLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Log out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
