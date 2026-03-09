import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getAuthData } from "../services/auth";
import { getPatients, deletePatient } from "../services/appointment";
import Navbar from "../components/Navbar";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);

  useEffect(() => {
    const { user: storedUser } = getAuthData();
    if (storedUser) {
      setUser(storedUser);
      setForm(storedUser);
    }
  }, []);

  // Fetch saved patients for this user
  useEffect(() => {
    if (!user || user.role !== "user") { setPatientsLoading(false); return; }
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(Array.isArray(data) ? data : []);
      } catch { setPatients([]); }
      finally { setPatientsLoading(false); }
    };
    fetchPatients();
  }, [user]);

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Remove this patient from your saved list?")) return;
    try {
      await deletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete patient");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const updated = { ...user, ...form };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    setEditing(false);
  };

  const handleCancel = () => {
    setForm(user);
    setEditing(false);
  };

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Count appointments
  const savedAppts = JSON.parse(localStorage.getItem("appointments") || "[]");
  const totalAppts = savedAppts.length;
  const completedAppts = savedAppts.filter((a) => a.status === "Completed").length;

  return (
    <div className="dash">
      <Navbar user={user} initials={initials} onLogout={handleLogout} />

      {/* ── Main content ── */}
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 className="dash-greeting">My Profile</h1>
            <p className="dash-date">Manage your personal information</p>
          </div>
        </header>

        {/* Profile card */}
        <div className="prof-card">
          <div className="prof-card-top">
            <div className="prof-avatar-lg">{initials}</div>
            <div className="prof-identity">
              <h2 className="prof-name">{user.fullName}</h2>
              <span className="prof-role-badge">
                {user.role === "doctor" ? "Doctor" : "User"}
              </span>
              <p className="prof-email">{user.email}</p>
            </div>
            {!editing && (
              <button className="dash-btn dash-btn-secondary prof-edit-btn" onClick={() => setEditing(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Profile
              </button>
            )}
          </div>

          {/* Mini stats */}
          <div className="prof-mini-stats">
            <div className="prof-mini-stat">
              <span className="prof-mini-val">{totalAppts}</span>
              <span className="prof-mini-label">Appointments</span>
            </div>
            <div className="prof-mini-divider" />
            <div className="prof-mini-stat">
              <span className="prof-mini-val">{completedAppts}</span>
              <span className="prof-mini-label">Completed</span>
            </div>
            <div className="prof-mini-divider" />
            <div className="prof-mini-stat">
              <span className="prof-mini-val">{user.role === "doctor" ? "Doctor" : "User"}</span>
              <span className="prof-mini-label">Account Type</span>
            </div>
          </div>
        </div>

        {/* Details section */}
        <div className="prof-details">
          <h3 className="prof-section-title">Personal Information</h3>

          <div className="prof-grid">
            <div className="prof-field">
              <label>Full Name</label>
              {editing ? (
                <input name="fullName" value={form.fullName || ""} onChange={handleChange} />
              ) : (
                <p>{user.fullName || "—"}</p>
              )}
            </div>
            <div className="prof-field">
              <label>Email Address</label>
              <p>{user.email || "—"}</p>
            </div>
            <div className="prof-field">
              <label>Phone Number</label>
              {editing ? (
                <input name="phone" value={form.phone || ""} onChange={handleChange} placeholder="+91 9876543210" />
              ) : (
                <p>{user.phone || "—"}</p>
              )}
            </div>
            <div className="prof-field">
              <label>Role</label>
              <p>{user.role === "doctor" ? "Doctor" : "User (Caretaker / Relative)"}</p>
            </div>

            {/* User-specific fields */}
            {user.role === "user" && (
              <>
                <div className="prof-field">
                  <label>Address</label>
                  {editing ? (
                    <input name="address" value={form.address || ""} onChange={handleChange} placeholder="Enter your address" />
                  ) : (
                    <p>{user.address || "—"}</p>
                  )}
                </div>
                <div className="prof-field">
                  <label>City</label>
                  {editing ? (
                    <input name="city" value={form.city || ""} onChange={handleChange} placeholder="Enter your city" />
                  ) : (
                    <p>{user.city || "—"}</p>
                  )}
                </div>
              </>
            )}

            {/* Doctor-specific fields */}
            {user.role === "doctor" && (
              <>
                <div className="prof-field">
                  <label>Specialization</label>
                  {editing ? (
                    <input name="specialization" value={form.specialization || ""} onChange={handleChange} />
                  ) : (
                    <p>{user.specialization || "—"}</p>
                  )}
                </div>
                <div className="prof-field">
                  <label>License Number</label>
                  {editing ? (
                    <input name="licenseNumber" value={form.licenseNumber || ""} onChange={handleChange} />
                  ) : (
                    <p>{user.licenseNumber || "—"}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {editing && (
            <div className="prof-actions">
              <button className="dash-btn dash-btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="dash-btn dash-btn-primary" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* My Patients section (only for users) */}
        {user.role === "user" && (
          <div className="prof-details" style={{ marginTop: 20 }}>
            <h3 className="prof-section-title">
              My Patients
              <span className="prof-patient-count">{patients.length}</span>
            </h3>

            {patientsLoading ? (
              <p className="prof-patients-empty">Loading patients…</p>
            ) : patients.length === 0 ? (
              <p className="prof-patients-empty">
                No patients saved yet. When you book an appointment, the patient details are automatically saved here for quick reuse.
              </p>
            ) : (
              <div className="prof-patients-list">
                {patients.map((p) => (
                  <div className="prof-patient-row" key={p.id}>
                    <div className="prof-patient-avatar">
                      {p.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="prof-patient-info">
                      <span className="prof-patient-name">{p.fullName}</span>
                      <span className="prof-patient-meta">
                        {p.relation} · {p.age} yrs · {p.gender}
                      </span>
                    </div>
                    <span className="prof-patient-date">
                      Added {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </span>
                    <button
                      className="prof-patient-delete"
                      title="Remove patient"
                      onClick={() => handleDeletePatient(p.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Account section */}
        <div className="prof-details" style={{ marginTop: 20 }}>
          <h3 className="prof-section-title">Account</h3>
          <div className="prof-grid">
            <div className="prof-field">
              <label>Member Since</label>
              <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "February 2026"}</p>
            </div>
            <div className="prof-field">
              <label>Account Status</label>
              <p><span className="prof-status-dot active" /> Active</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
