import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getAuthData } from "../services/auth";
import { getDoctors } from "../services/appointment";
import Navbar from "../components/Navbar";
import "./doctors.css";

function Doctors() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user: storedUser } = getAuthData();
    if (storedUser) setUser(storedUser);

    getDoctors()
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Failed to load doctors:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  if (!user) return null;
  if (loading) return <div className="dash"><p style={{ padding: "2rem", textAlign: "center" }}>Loading doctors…</p></div>;

  const initials = user.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const departments = ["All", ...new Set(doctors.map((d) => d.department).filter(Boolean))];
  const filtered = filter === "All" ? doctors : doctors.filter((d) => d.department === filter);

  return (
    <div className="dash">
      <Navbar user={user} initials={initials} onLogout={handleLogout} />

      <main className="dash-main">
        {/* Page header */}
        <div className="doc-page-header">
          <div>
            <h1 className="doc-page-title">Our Doctors</h1>
            <p className="doc-page-subtitle">
              Meet our team of {doctors.length} highly qualified specialists committed to your health and well-being.
            </p>
          </div>
          <div className="doc-header-stats">
            <div className="doc-header-stat">
              <span className="doc-header-stat-val">{doctors.length}</span>
              <span className="doc-header-stat-label">Specialists</span>
            </div>
            <div className="doc-header-stat">
              <span className="doc-header-stat-val">{doctors.filter((d) => d.available).length}</span>
              <span className="doc-header-stat-label">Available Now</span>
            </div>
            <div className="doc-header-stat">
              <span className="doc-header-stat-val">{new Set(doctors.map((d) => d.department)).size}</span>
              <span className="doc-header-stat-label">Departments</span>
            </div>
          </div>
        </div>

        {/* Department filter */}
        <div className="doc-filters">
          {departments.map((dept) => (
            <button
              key={dept}
              className={`doc-filter-chip ${filter === dept ? "active" : ""}`}
              onClick={() => setFilter(dept)}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Doctor cards */}
        <div className="doc-grid">
          {filtered.map((doc) => (
            <div className={`doc-card ${!doc.available ? "unavailable" : ""}`} key={doc.id}>
              {/* Availability badge */}
              <span className={`doc-avail-badge ${doc.available ? "online" : "offline"}`}>
                {doc.available ? "Available" : "Unavailable"}
              </span>

              {/* Avatar */}
              <div className="doc-card-avatar">
                {(doc.name || doc.fullName || "").split(" ").slice(0, 2).map((w) => w[0]).join("")}
              </div>

              {/* Name & specialty */}
              <h3 className="doc-card-name">{doc.name || doc.fullName}</h3>
              {/* <p className="doc-card-spec">{doc.specialization}</p> */}
              <p className="doc-card-qual">{doc.qualification}</p>

              {/* Quick stats row */}
              <div className="doc-card-stats">
                <div className="doc-card-stat">
                  <span className="doc-card-stat-val">{doc.experience}+</span>
                  <span className="doc-card-stat-lbl">Years Exp.</span>
                </div>
                <div className="doc-card-stat-divider" />
                <div className="doc-card-stat">
                  <span className="doc-card-stat-val">{doc.department}</span>
                  <span className="doc-card-stat-lbl">Department</span>
                </div>
              </div>

              {/* Qualification tags */}
              <div className="doc-card-tags">
                {doc.qualification.split(", ").map((q) => (
                  <span className="doc-card-tag" key={q}>{q}</span>
                ))}
                <span className="doc-card-tag">₹{doc.fee} / visit</span>
              </div>

              {/* Expand for more info */}
              {expandedId === doc.id && (
                <div className="doc-card-expanded">
                  <p className="doc-card-bio">{doc.bio}</p>
                  <div className="doc-card-detail-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>{doc.timings}</span>
                  </div>
                  <div className="doc-card-detail-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    <span>{doc.languages.join(", ")}</span>
                  </div>
                </div>
              )}

              <button
                className="doc-card-toggle"
                onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
              >
                {expandedId === doc.id ? "Show Less" : "View Details"}
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: expandedId === doc.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Doctors;
