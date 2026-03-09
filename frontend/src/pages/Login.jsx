import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import "./auth.css";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.email || !form.password) {
      setLoading(false);
      return setError("Please fill in all fields.");
    }

    try {
      const response = await login({
        email: form.email,
        password: form.password,
        role: role,
      });

      // Navigate based on user role
      if (response.user.role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : `Log In as ${role === "doctor" ? "Doctor" : "User"}`}
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
