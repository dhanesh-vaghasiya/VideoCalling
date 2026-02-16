import { useState } from "react";
import { DOCTORS, CONSULTATION_TYPES, SYMPTOMS, RELATIONS } from "../constants";

function AppointmentModal({ user, onClose, onSubmit }) {
  const [step, setStep] = useState(1);

  // Step 1 – Patient details
  const [patientName, setPatientName] = useState("");
  const [relation, setRelation] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");

  // Step 2 – Consultation details
  const [consultationType, setConsultationType] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  // Step 3 – Mobile verification
  const [mobile, setMobile] = useState(user?.phone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");

  const toggleSymptom = (s) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const canProceedStep1 = patientName && relation && patientAge && patientGender;
  const canProceedStep2 = consultationType && selectedSymptoms.length > 0 && selectedDoctor && appointmentDate && appointmentTime;

  const handleSendOtp = () => {
    if (!mobile || mobile.replace(/\D/g, "").length < 10) return alert("Please enter a valid 10-digit mobile number.");
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpVerified(false);
    alert(`OTP sent to +91 ${mobile.replace(/\D/g, "")} (Demo OTP: ${code})`);
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      setOtpVerified(true);
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpVerified) return alert("Please verify your mobile number first.");

    const doctor = DOCTORS.find((d) => d.id === Number(selectedDoctor));
    const newAppt = {
      id: Date.now(),
      patientName,
      relation,
      patientAge,
      patientGender,
      consultationType: CONSULTATION_TYPES.find((c) => c.value === consultationType)?.label || consultationType,
      symptoms: selectedSymptoms,
      doctor: doctor.name,
      specialization: doctor.specialization,
      fee: doctor.fee,
      date: appointmentDate,
      time: appointmentTime,
      mobile: mobile.replace(/\D/g, ""),
      status: "Pending",
      requestedOn: new Date().toISOString(),
      bookedBy: user.fullName,
    };

    onSubmit(newAppt);
  };

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div className="dash-modal dash-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="dash-modal-header">
          <h2>Book Appointment</h2>
          <div className="dash-steps-indicator">
            <span className={`dash-step-dot ${step >= 1 ? "active" : ""}`}>1</span>
            <span className="dash-step-line" />
            <span className={`dash-step-dot ${step >= 2 ? "active" : ""}`}>2</span>
            <span className="dash-step-line" />
            <span className={`dash-step-dot ${step >= 3 ? "active" : ""}`}>3</span>
          </div>
          <button className="dash-modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dash-modal-body">

            {/* ── Step 1: Patient Information ── */}
            {step === 1 && (
              <>
                <p className="dash-step-label">Step 1 of 3 — Patient Information</p>
                <p className="dash-step-hint">Who is this appointment for?</p>

                <div className="dash-form-group">
                  <label>Patient&apos;s Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter patient's full name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className="dash-form-group">
                  <label>Relation to You *</label>
                  <select value={relation} onChange={(e) => setRelation(e.target.value)} required>
                    <option value="">Select relation…</option>
                    {RELATIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="dash-form-row">
                  <div className="dash-form-group">
                    <label>Patient&apos;s Age *</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      placeholder="Age in years"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      required
                    />
                  </div>
                  <div className="dash-form-group">
                    <label>Gender *</label>
                    <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)} required>
                      <option value="">Select…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 2: Consultation Details ── */}
            {step === 2 && (
              <>
                <p className="dash-step-label">Step 2 of 3 — Health Concern</p>
                <p className="dash-step-hint">Select the type of consultation and describe symptoms.</p>

                <div className="dash-form-group">
                  <label>Consultation Type *</label>
                  <div className="dash-consultation-grid">
                    {CONSULTATION_TYPES.map((ct) => (
                      <label
                        key={ct.value}
                        className={`dash-consult-card ${consultationType === ct.value ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="consultationType"
                          value={ct.value}
                          checked={consultationType === ct.value}
                          onChange={() => setConsultationType(ct.value)}
                        />
                        <div className="dash-consult-label">{ct.label}</div>
                        <div className="dash-consult-desc">{ct.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="dash-form-group">
                  <label>Symptoms * <span className="dash-form-sub">(select all that apply)</span></label>
                  <div className="dash-symptom-grid">
                    {SYMPTOMS.map((s) => (
                      <label
                        key={s}
                        className={`dash-symptom-chip ${selectedSymptoms.includes(s) ? "selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSymptoms.includes(s)}
                          onChange={() => toggleSymptom(s)}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="dash-form-group">
                  <label>Select Doctor *</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    required
                  >
                    <option value="">Choose a doctor…</option>
                    {DOCTORS.filter((d) => d.available).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.specialization} (₹{d.fee})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dash-form-row">
                  <div className="dash-form-group">
                    <label>Preferred Date *</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="dash-form-group">
                    <label>Preferred Time *</label>
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── Step 3: Verify & Submit ── */}
            {step === 3 && (
              <>
                <p className="dash-step-label">Step 3 of 3 — Verify & Confirm</p>
                <p className="dash-step-hint">Review appointment details and verify your mobile number.</p>

                <div className="dash-review-card">
                  <div className="dash-review-row">
                    <span className="dash-review-label">Patient</span>
                    <span>{patientName} ({patientGender}, {patientAge} yrs)</span>
                  </div>
                  <div className="dash-review-row">
                    <span className="dash-review-label">Relation</span>
                    <span>{relation}</span>
                  </div>
                  <div className="dash-review-row">
                    <span className="dash-review-label">Type</span>
                    <span>{CONSULTATION_TYPES.find((c) => c.value === consultationType)?.label}</span>
                  </div>
                  <div className="dash-review-row">
                    <span className="dash-review-label">Symptoms</span>
                    <span>{selectedSymptoms.join(", ")}</span>
                  </div>
                  <div className="dash-review-row">
                    <span className="dash-review-label">Doctor</span>
                    <span>{DOCTORS.find((d) => d.id === Number(selectedDoctor))?.name}</span>
                  </div>
                  <div className="dash-review-row">
                    <span className="dash-review-label">Date & Time</span>
                    <span>
                      {new Date(appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {" "}at {appointmentTime}
                    </span>
                  </div>
                  <div className="dash-review-row">
                    <span className="dash-review-label">Booked By</span>
                    <span>{user.fullName}</span>
                  </div>
                </div>

                <div className="dash-form-group">
                  <label>Mobile Number *</label>
                  <div className="dash-otp-row">
                    <div className="dash-otp-input-wrap">
                      <span className="dash-otp-prefix">+91</span>
                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="9876543210"
                        value={mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setMobile(val);
                          if (otpSent) { setOtpSent(false); setOtpVerified(false); setOtp(""); }
                        }}
                        required
                        disabled={otpVerified}
                      />
                    </div>
                    {!otpVerified && (
                      <button type="button" className="dash-btn dash-btn-otp" onClick={handleSendOtp} disabled={mobile.replace(/\D/g, "").length < 10}>
                        {otpSent ? "Resend OTP" : "Send OTP"}
                      </button>
                    )}
                    {otpVerified && <span className="dash-verified-badge">Verified</span>}
                  </div>
                </div>

                {otpSent && !otpVerified && (
                  <div className="dash-form-group">
                    <label>Enter OTP</label>
                    <div className="dash-otp-row">
                      <input
                        type="text"
                        maxLength="4"
                        placeholder="4-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        style={{ maxWidth: 140, textAlign: "center", letterSpacing: 6, fontWeight: 700 }}
                      />
                      <button type="button" className="dash-btn dash-btn-otp" onClick={handleVerifyOtp} disabled={otp.length < 4}>
                        Verify
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="dash-modal-footer">
            {step > 1 && (
              <button type="button" className="dash-btn dash-btn-secondary" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 3 && (
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                onClick={() => setStep(step + 1)}
              >
                Continue
              </button>
            )}
            {step === 3 && (
              <button type="submit" className="dash-btn dash-btn-primary" disabled={!otpVerified}>
                Confirm Appointment
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentModal;
