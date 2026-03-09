import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CountdownTimer from "./CountdownTimer";
import ReactMarkdown from 'react-markdown';

function AppointmentHistory({ appointments }) {
  const navigate = useNavigate();
  const [activeMeetings, setActiveMeetings] = useState({});

  const handleJoin = (meetingLink) => {
    navigate(`/meeting/${meetingLink}`, { state: { name: 'Patient' } });
  };

  // Helper function to check if the meeting is currently "active" (within 1 hour from start time)
  // Time format expected: "HH:MM AM/PM"
  const isMeetingActive = (dateStr, timeStr) => {
    const apptDate = new Date(dateStr);
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    apptDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffInMs = now - apptDate;
    const diffInMinutes = diffInMs / (1000 * 60);

    // Active if it's currently the meeting time or up to 60 minutes after
    return diffInMinutes >= 0 && diffInMinutes <= 60;
  };

  return (
    <section className="dash-recent">
      <h2 className="dash-section-title">Appointment History</h2>
      {appointments.length === 0 ? (
        <div className="dash-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          <p>No appointments yet. Request your first consultation above.</p>
        </div>
      ) : (
        <div className="dash-appt-list">
          {appointments.map((appt) => {
            // Determine active status dynamically right before rendering
            const isActive = isMeetingActive(appt.date, appt.time);

            return (
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
                  {appt.status !== "Cancelled" && appt.status !== "Completed" && !isActive && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
                      Meeting Window: {appt.time} to {(function () {
                        const tDate = new Date(`2000/01/01 ${appt.time}`);
                        tDate.setHours(tDate.getHours() + 1);
                        return tDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      })()}
                    </p>
                  )}
                  {isActive && (
                    <span style={{ color: "#28a745", fontSize: "0.85rem", fontWeight: "bold", marginLeft: "10px" }}>
                      ● Meeting is Live
                    </span>
                  )}
                  <p className="dash-appt-reason">
                    Patient: {appt.patientName || "—"} ({appt.relation || "Self"}) · {appt.consultationType || appt.reason || "—"}
                  </p>
                  {appt.meetingSummary && (
                    <div id={`summary-${appt.id}`} className="dash-appt-summary" style={{ display: "none", marginTop: "10px", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "6px", fontSize: "0.85rem", whiteSpace: "normal", borderLeft: "4px solid var(--primary-color)" }}>
                      <strong style={{ display: "block", marginBottom: "4px", color: "var(--text-color)" }}>Meeting Summary:</strong>
                      <div className="markdown-content" style={{ lineHeight: "1.6" }}>
                        <ReactMarkdown>{appt.meetingSummary.replace(/\\n/g, '\n')}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
                <div className="dash-appt-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span className={`dash-appt-badge ${appt.status.toLowerCase()}`}>
                    {appt.status}
                  </span>
                  {/* Always render the button if the appointment is Confirmed or Scheduled, but disable it if not active */}
                  {(appt.status === "Scheduled" || appt.status === "Confirmed" || appt.status === "Completed") && (
                    <button
                      onClick={() => handleJoin(appt.meetingLink)}
                      disabled={!isActive || !appt.meetingLink}
                      style={{
                        backgroundColor: (isActive && appt.meetingLink) ? '#28a745' : '#cbd5e0',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: (isActive && appt.meetingLink) ? 'pointer' : 'not-allowed',
                        fontSize: '0.85rem'
                      }}
                      title={!appt.meetingLink ? "Doctor has not created the meeting link yet" : ""}
                    >
                      {appt.status === "Completed" ? "Re-join Video Call" : "Join Video Call"}
                    </button>
                  )}

                  {/* Summary Button */}
                  {appt.meetingSummary && (
                    <button
                      onClick={() => {
                        const el = document.getElementById(`summary-${appt.id}`);
                        if (el) el.style.display = el.style.display === "none" ? "block" : "none";
                      }}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        marginTop: '4px'
                      }}
                    >
                      Summary
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AppointmentHistory;
