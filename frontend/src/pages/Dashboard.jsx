import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getAuthData } from "../services/auth";
import { getAppointments, getDoctors } from "../services/appointment";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import StatsCards from "../components/StatsCards";
import AppointmentCard from "../components/AppointmentCard";
import AppointmentHistory from "../components/AppointmentHistory";
import AppointmentModal from "../components/AppointmentModal";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const { user: storedUser } = getAuthData();
    if (storedUser) setUser(storedUser);

    getDoctors()
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Failed to load doctors:", err));
  }, []);

  // Fetch appointments from backend whenever user is loaded
  useEffect(() => {
    if (!user) return;
    getAppointments()
      .then((data) => setAppointments(data))
      .catch((err) => console.error("Failed to load appointments:", err));
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleNewAppointment = (newAppt) => {
    setAppointments((prev) => [newAppt, ...prev]);
    setShowModal(false);
  };

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const pending = appointments.filter((a) => a.status === "Pending").length;
  const confirmed = appointments.filter((a) => a.status === "Confirmed").length;
  const completed = appointments.filter((a) => a.status === "Completed").length;

  return (
    <div className="dash">
      <Navbar
        user={user}
        initials={initials}
        onOpenModal={openModal}
        onLogout={handleLogout}
      />

      <main className="dash-main">
        <Header user={user} initials={initials} />
        <StatsCards
          total={appointments.length}
          pending={pending}
          confirmed={confirmed}
          completed={completed}
        />
        <AppointmentCard onOpenModal={openModal} />
        <AppointmentHistory appointments={appointments} />
      </main>

      {showModal && (
        <AppointmentModal
          user={user}
          doctors={doctors}
          onClose={closeModal}
          onSubmit={handleNewAppointment}
        />
      )}
    </div>
  );
}

export default Dashboard;