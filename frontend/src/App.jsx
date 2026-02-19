import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import Meeting from "./pages/Meeting";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Doctors from "./pages/Doctors";
import DoctorDashboard from "./pages/DoctorDashboard";
import People from "./pages/People";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Guest-only pages (redirect to dashboard if already logged in) ── */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

        {/* ── User-only pages ── */}
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute requiredRole="user"><Profile /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute requiredRole="user" ><About /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute requiredRole="user"><Doctors /></ProtectedRoute>} />

        {/* ── Doctor-only pages ── */}
        <Route path="/doctor-dashboard" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/people" element={<ProtectedRoute requiredRole="doctor"><People /></ProtectedRoute>} />

        {/* ── Shared authenticated pages ── */}
        <Route path="/meeting/:id" element={<ProtectedRoute><Meeting /></ProtectedRoute>} />

        {/* Default: send to login (route guards handle the rest) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
