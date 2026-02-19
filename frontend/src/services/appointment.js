/**
 * Appointment & Patient Service
 * Handles all API calls for patients and appointments.
 */

const API_BASE = "http://localhost:5000/api";

/** Helper – build headers with Bearer token */
const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    
  }
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/** Generic fetch wrapper with error handling */
const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, { ...options, headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

// ─────────────────────────────────────────────
//  DOCTOR  endpoints (public)
// ─────────────────────────────────────────────

/** Fetch all doctors from the database */
export const getDoctors = () => apiFetch(`${API_BASE}/doctors`);

/** Fetch a single doctor */
export const getDoctor = (id) => apiFetch(`${API_BASE}/doctors/${id}`);

// ─────────────────────────────────────────────
//  PATIENT  endpoints
// ─────────────────────────────────────────────

/** List all patients for the current user */
export const getPatients = () => apiFetch(`${API_BASE}/patients`);

/** Get a single patient */
export const getPatient = (id) => apiFetch(`${API_BASE}/patients/${id}`);

/** Create a new patient */
export const createPatient = (patientData) =>
  apiFetch(`${API_BASE}/patients`, {
    method: "POST",
    body: JSON.stringify(patientData),
  });

/** Update an existing patient */
export const updatePatient = (id, patientData) =>
  apiFetch(`${API_BASE}/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(patientData),
  });

/** Delete a patient */
export const deletePatient = (id) =>
  apiFetch(`${API_BASE}/patients/${id}`, { method: "DELETE" });

// ─────────────────────────────────────────────
//  APPOINTMENT  endpoints
// ─────────────────────────────────────────────

/** Create a new appointment */
export const createAppointment = (appointmentData) =>
  apiFetch(`${API_BASE}/appointments`, {
    method: "POST",
    body: JSON.stringify(appointmentData),
  });

/** List appointments (scoped by role on the server) */
export const getAppointments = (status) => {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch(`${API_BASE}/appointments${qs}`);
};

/** Get a single appointment */
export const getAppointment = (id) =>
  apiFetch(`${API_BASE}/appointments/${id}`);

/** Update appointment status (Confirmed, Completed, Cancelled) */
export const updateAppointmentStatus = (id, status) =>
  apiFetch(`${API_BASE}/appointments/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

/** Delete an appointment */
export const deleteAppointment = (id) =>
  apiFetch(`${API_BASE}/appointments/${id}`, { method: "DELETE" });

// ─────────────────────────────────────────────
//  COMBO helper – create patient + appointment in one call
// ─────────────────────────────────────────────

/**
 * Books an appointment by first creating the patient record
 * (or reusing an existing one) and then creating the appointment.
 *
 * @param {Object} payload – the full form data from AppointmentModal
 * @returns {{ patient, appointment }}
 */
export const bookAppointment = async (payload) => {
  // 1. Create or find the patient
  const patient = await createPatient({
    fullName: payload.patientName,
    relation: payload.relation,
    age: payload.patientAge,
    gender: payload.patientGender,
  });

  // 2. Create the appointment
  const appointment = await createAppointment({
    patientId: patient.id,
    doctorId: payload.doctorId,
    consultationType: payload.consultationType,
    symptoms: payload.symptoms,
    date: payload.date,
    time: payload.time,
    mobile: payload.mobile,
  });

  return { patient, appointment };
};
