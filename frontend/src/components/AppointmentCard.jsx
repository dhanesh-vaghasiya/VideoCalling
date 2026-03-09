function AppointmentCard({ onOpenModal }) {
  return (
    <section className="dash-actions" style={{ gridTemplateColumns: "1fr" }}>
      <div className="dash-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 className="dash-card-title" style={{ margin: 0 }}>Request an Appointment</h2>
          <button className="dash-btn dash-btn-primary" onClick={onOpenModal}>
            + New Appointment
          </button>
        </div>
        <p className="dash-card-desc" style={{ margin: 0 }}>
          Book an appointment for yourself or a family member. Select a doctor and describe the health concern.
        </p>
      </div>
    </section>
  );
}

export default AppointmentCard;
