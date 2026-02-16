import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(stored));

    const savedAppts = localStorage.getItem("appointments");
    if (savedAppts) setAppointments(JSON.parse(savedAppts));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleNewAppointment = (newAppt) => {
    const updated = [newAppt, ...appointments];
    setAppointments(updated);
    localStorage.setItem("appointments", JSON.stringify(updated));
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
          onClose={closeModal}
          onSubmit={handleNewAppointment}
        />
      )}
    </div>
  );
}

export default Dashboard;