import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./about.css";

/* ── Hospital data ── */
const STATS = [
  { value: "4,500+", label: "Happy Patients Yearly" },
  { value: "200+", label: "Hospital Rooms" },
  { value: "500+", label: "Awards Won" },
  { value: "8", label: "Departments" },
  { value: "120+", label: "Doctors & Staff" },
  { value: "20+", label: "Ambulances" },
];

const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Gynecology & Obstetrics",
  "Mental Health",
];

const FACILITIES = [
  { title: "Emergency Services", desc: "24/7 immediate medical care for critical conditions, accidents, and life-threatening situations. Equipped to handle trauma, cardiac arrest, and urgent interventions.", icon: "emergency" },
  { title: "Radiology & Imaging", desc: "Advanced diagnostic imaging including X-ray, CT scan, MRI, and ultrasound to assist in accurate and efficient diagnosis of medical conditions.", icon: "radiology" },
  { title: "Laboratory Services", desc: "Comprehensive lab testing for blood, urine, and other samples — supporting fast and precise medical diagnosis and treatment planning.", icon: "lab" },
  { title: "Pharmacy", desc: "In-house medical store providing prescribed medications and health essentials, ensuring timely access to necessary drugs for both inpatients and outpatients.", icon: "pharmacy" },
  { title: "ICU & Critical Care", desc: "State-of-the-art intensive care units with advanced life-support systems, monitored 24/7 by trained critical care specialists.", icon: "icu" },
  { title: "Operation Theatres", desc: "Fully equipped modular operation theatres with laminar airflow, supporting major and minor surgical procedures across all specialties.", icon: "ot" },
];

const TIMELINE = [
  { year: "2005", event: "Nova Super Specialist Hospital established with 50 beds and 3 departments." },
  { year: "2010", event: "Expanded to 120 beds. Added Cardiology, Neurology, and Orthopedic wings." },
  { year: "2015", event: "Received NABH accreditation. Launched 24/7 emergency and trauma centre." },
  { year: "2019", event: "Introduced telemedicine services and AI-assisted diagnostics platform." },
  { year: "2023", event: "Expanded to 200+ rooms. Crossed 25,000 successful surgeries milestone." },
  { year: "2026", event: "Launched online appointment booking and video consultation platform." },
];

function About() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="dash">
      <Navbar user={user} initials={initials} onLogout={handleLogout} />

      <main className="dash-main">
        {/* ── Hero / Intro ── */}
        <section className="abt-hero">
          <div className="abt-hero-content">
            <h1 className="abt-hero-title">Nova Super Specialist Hospital</h1>
            <p className="abt-hero-tagline">Premium Treatments for a Healthy Lifestyle</p>
            <p className="abt-hero-desc">
              Since 2005, Nova Super Specialist Hospital has been a beacon of world-class healthcare in the heart of the city.
              With cutting-edge technology, compassionate specialists, and a patient-first approach, we are committed to
              delivering exceptional medical care for you and your loved ones.
            </p>
          </div>
          <div className="abt-hero-accent">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#5B8FA8" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
              <path d="M12 2L12 22" /><path d="M2 12L22 12" />
            </svg>
          </div>
        </section>

        {/* ── Key Stats ── */}
        <section className="abt-stats-grid">
          {STATS.map((s) => (
            <div className="abt-stat-card" key={s.label}>
              <span className="abt-stat-val">{s.value}</span>
              <span className="abt-stat-label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* ── Our Mission & Vision ── */}
        <section className="abt-section">
          <div className="abt-two-col">
            <div className="abt-col-card">
              <div className="abt-col-icon mission">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
              <h3>Our Mission</h3>
              <p>To provide accessible, affordable, and compassionate healthcare services with the highest standards of medical excellence, ensuring every patient receives personalized treatment backed by modern technology.</p>
            </div>
            <div className="abt-col-card">
              <div className="abt-col-icon vision">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <h3>Our Vision</h3>
              <p>To be the most trusted healthcare institution, recognized for clinical excellence, innovation, and holistic patient care — setting benchmarks in medical practice across the region and beyond.</p>
            </div>
          </div>
        </section>

        {/* ── Departments ── */}
        <section className="abt-section">
          <h2 className="abt-section-title">Departments</h2>
          <p className="abt-section-subtitle">Browse by department for tailored services and expert solutions</p>
          <div className="abt-dept-grid">
            {DEPARTMENTS.map((dept) => (
              <div className="abt-dept-chip" key={dept}>
                <span className="abt-dept-dot" />
                {dept}
              </div>
            ))}
          </div>
        </section>

        {/* ── Facilities & Services ── */}
        <section className="abt-section">
          <h2 className="abt-section-title">World-Class Facilities</h2>
          <p className="abt-section-subtitle">Healthcare services for you and your loved ones</p>
          <div className="abt-facilities-grid">
            {FACILITIES.map((f) => (
              <div className="abt-facility-card" key={f.title}>
                <div className="abt-facility-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="abt-section">
          <h2 className="abt-section-title">Our Journey</h2>
          <p className="abt-section-subtitle">Two decades of growth, innovation, and care</p>
          <div className="abt-timeline">
            {TIMELINE.map((t, i) => (
              <div className={`abt-timeline-item ${i % 2 === 0 ? "left" : "right"}`} key={t.year}>
                <div className="abt-timeline-dot" />
                <div className="abt-timeline-content">
                  <span className="abt-timeline-year">{t.year}</span>
                  <p className="abt-timeline-event">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact & Location ── */}
        <section className="abt-section">
          <h2 className="abt-section-title">Contact & Location</h2>
          <p className="abt-section-subtitle">Reach out to us anytime — we are here for you</p>
          <div className="abt-contact-grid">
            <div className="abt-contact-card">
              <div className="abt-contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <h4>Address</h4>
              <p>Nova Super Specialist Hospital<br />Plot No. 42, Sector 15, Health City<br />New Delhi – 110075, India</p>
            </div>
            <div className="abt-contact-card">
              <div className="abt-contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <h4>Phone</h4>
              <p>Emergency: <strong>+91 11 2600 1234</strong><br />Reception: +91 11 2600 5678<br />Helpline (Toll-free): 1800-200-NOVA</p>
            </div>
            <div className="abt-contact-card">
              <div className="abt-contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h4>Email</h4>
              <p>General: info@novahospital.in<br />Appointments: appointments@novahospital.in<br />Careers: hr@novahospital.in</p>
            </div>
            <div className="abt-contact-card">
              <div className="abt-contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h4>Working Hours</h4>
              <p>OPD: Mon–Sat, 8:00 AM – 8:00 PM<br />Emergency: 24 / 7 / 365<br />Pharmacy: 6:00 AM – 11:00 PM</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default About;
