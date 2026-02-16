import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard – main page */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Profile page */}
        <Route path="/profile" element={<Profile />} />

        {/* About Us */}
        <Route path="/about" element={<About />} />

        {/* Doctors */}
        <Route path="/doctors" element={<Doctors />} />

        {/* Doctor Dashboard */}
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

        {/* People (Patient Detail for Doctor) */}
        <Route path="/people" element={<People />} />

        {/* Meeting Page */}
        <Route path="/meeting/:id" element={<Meeting />} />

        {/* Default: send to dashboard (redirects to login if not authed) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
