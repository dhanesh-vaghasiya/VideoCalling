import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // Doctor-specific
    specialization: "",
    licenseNumber: "",
    // User-specific
    address: "",
    city: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.phone || !form.password) {
      return setError("Please fill in all required fields.");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (role === "doctor" && !form.specialization) {
      return setError("Specialization is required for doctors.");
    }

    // TODO: call backend signup API
    console.log("Signup payload:", { role, ...form });

    // Cache signup data so login can build the full user profile
    localStorage.setItem(
      "signupData",
      JSON.stringify({ role, ...form })
    );

    alert("Account created successfully! Please log in.");
    navigate("/login");
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">🏥</div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join our telemedicine platform</p>

        {/* Role toggle */}
        <div className="role-toggle">
          <button
            className={`role-btn ${role === "user" ? "active" : ""}`}
            onClick={() => setRole("user")}
            type="button"
          >
            👤 User
          </button>
          <button
            className={`role-btn ${role === "doctor" ? "active" : ""}`}
            onClick={() => setRole("doctor")}
            type="button"
          >
            👨‍⚕️ Doctor
          </button>
        </div>

        {role === "user" && (
          <p className="auth-hint">
            Register as a user to book appointments for yourself or your family members.
          </p>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Common fields */}
          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <input
              name="fullName"
              placeholder="Your full name"
              value={form.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email *</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Phone *</label>
            <input
              name="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label className="input-label">Password *</label>
              <input
                name="password"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Confirm Password *</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Doctor-specific fields */}
          {role === "doctor" && (
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Specialization *</label>
                <input
                  name="specialization"
                  placeholder="e.g. Cardiology"
                  value={form.specialization}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label className="input-label">License Number</label>
                <input
                  name="licenseNumber"
                  placeholder="MCI-XXXXX"
                  value={form.licenseNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* User-specific fields */}
          {role === "user" && (
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Address</label>
                <input
                  name="address"
                  placeholder="Street address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label className="input-label">City</label>
                <input
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button type="submit" className="auth-btn">
            Sign Up as {role === "doctor" ? "Doctor" : "User"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
