import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("Please fill in all fields.");
    }

    // TODO: call backend login API
    console.log("Login payload:", { role, ...form });

    // Build user profile from cached signup data if available
    const signupRaw = localStorage.getItem("signupData");
    const signup = signupRaw ? JSON.parse(signupRaw) : {};

    const user = {
      fullName: signup.fullName || form.email.split("@")[0],
      email: form.email,
      phone: signup.phone || "",
      role,
      // Doctor fields
      specialization: signup.specialization || "",
      licenseNumber: signup.licenseNumber || "",
      // User fields
      address: signup.address || "",
      city: signup.city || "",
    };
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.removeItem("signupData");

    navigate(role === "doctor" ? "/doctor-dashboard" : "/dashboard");
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">🏥</div>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Log in to your account</p>

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
            Log in as a user to book appointments for yourself or your family members.
          </p>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-btn">
            Log In as {role === "doctor" ? "Doctor" : "User"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
