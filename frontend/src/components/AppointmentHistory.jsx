function AppointmentHistory({ appointments }) {
  return (
    <section className="dash-recent">
      <h2 className="dash-section-title">Appointment History</h2>
      {appointments.length === 0 ? (
        <div className="dash-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p>No appointments yet. Request your first consultation above.</p>
        </div>
      ) : (
        <div className="dash-appt-list">
          {appointments.map((appt) => (
            <div className="dash-appt-row" key={appt.id}>
              <div className="dash-appt-left">
                <div className="dash-appt-doctor-avatar">
                  {appt.doctor.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </div>
                <div>
                  <p className="dash-appt-doctor">{appt.doctor}</p>
                  <p className="dash-appt-spec">{appt.specialization}</p>
                </div>
              </div>
              <div className="dash-appt-mid">
                <p className="dash-appt-date">
                  {new Date(appt.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" "}at {appt.time}
                </p>
                <p className="dash-appt-reason">
                  Patient: {appt.patientName || "—"} ({appt.relation || "Self"}) · {appt.consultationType || appt.reason || "—"}
                </p>
              </div>
              <div className="dash-appt-right">
                <span className={`dash-appt-badge ${appt.status.toLowerCase()}`}>
                  {appt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AppointmentHistory;
