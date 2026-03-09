"""
Appointment routes – create, list, update status.
Prefix: /api/appointments
"""

from flask import Blueprint, request, jsonify
from extensions import db
from model import Appointment, Patient, Doctor
from middleware.auth import token_required

appointment_bp = Blueprint("appointment", __name__, url_prefix="/api/appointments")


# ── Create appointment ──
@appointment_bp.route("", methods=["POST"])
@token_required
def create_appointment(*, current_user):
    """Book a new appointment.

    Expected JSON body:
    {
      "patientId":        int,
      "doctorId":         int,
      "consultationType": str,
      "symptoms":         str | list,   # comma-separated or array
      "date":             "YYYY-MM-DD",
      "time":             "HH:MM",
      "mobile":           str (optional)
    }
    """
    data = request.get_json() or {}

    required = ("patientId", "doctorId", "consultationType", "date", "time")
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    # Validate patient belongs to user
    patient = Patient.query.filter_by(id=data["patientId"], user_id=current_user.id).first()
    if not patient:
        return jsonify({"error": "Patient not found or does not belong to you"}), 404

    # Validate doctor exists
    doctor = Doctor.query.get(data["doctorId"])
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    # Normalise symptoms to comma-separated string
    symptoms = data.get("symptoms", "")
    if isinstance(symptoms, list):
        symptoms = ",".join(symptoms)

    appointment = Appointment(
        patient_id        = patient.id,
        doctor_id         = doctor.id,
        user_id           = current_user.id,
        consultation_type = data["consultationType"].strip(),
        symptoms          = symptoms,
        date              = data["date"].strip(),
        time              = data["time"].strip(),
        mobile            = data.get("mobile", "").strip() or None,
        status            = "Pending",
    )

    db.session.add(appointment)
    db.session.commit()

    return jsonify(appointment.to_dict()), 201


# ── List appointments ──
@appointment_bp.route("", methods=["GET"])
@token_required
def list_appointments(*, current_user):
    """Return appointments scoped to the current user's role.

    - user  → all appointments the user has booked
    - doctor → all appointments assigned to the doctor

    Optional query params:
        ?status=Pending        filter by status
    """
    status_filter = request.args.get("status")

    if current_user.role == "doctor":
        query = Appointment.query.filter_by(doctor_id=current_user.id)
    else:
        query = Appointment.query.filter_by(user_id=current_user.id)

    if status_filter:
        query = query.filter_by(status=status_filter)

    appointments = query.order_by(Appointment.created_at.desc()).all()
    return jsonify([a.to_dict() for a in appointments])


# ── Get single appointment ──
@appointment_bp.route("/<int:appointment_id>", methods=["GET"])
@token_required
def get_appointment(appointment_id, *, current_user):
    appt = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({"error": "Appointment not found"}), 404

    # Authorisation: owner or assigned doctor only
    if current_user.role == "doctor" and appt.doctor_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403
    if current_user.role == "user" and appt.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(appt.to_dict())


# ── Update appointment status (doctor or user) ──
@appointment_bp.route("/<int:appointment_id>/status", methods=["PUT"])
@token_required
def update_status(appointment_id, *, current_user):
    """Update appointment status.

    Doctors can: Pending → Confirmed, Confirmed → Completed, * → Cancelled
    Users  can: * → Cancelled
    """
    appt = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({"error": "Appointment not found"}), 404

    # Authorisation
    if current_user.role == "doctor" and appt.doctor_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403
    if current_user.role == "user" and appt.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    data       = request.get_json() or {}
    new_status = data.get("status", "").strip()
    allowed    = ("Pending", "Confirmed", "Completed", "Cancelled")

    if new_status not in allowed:
        return jsonify({"error": f"Invalid status. Must be one of {allowed}"}), 400

    # Users can only cancel
    if current_user.role == "user" and new_status != "Cancelled":
        return jsonify({"error": "You can only cancel appointments"}), 403

    appt.status = new_status
    db.session.commit()

    return jsonify(appt.to_dict())


# ── Delete appointment (user only, soft-cancel alternative) ──
@appointment_bp.route("/<int:appointment_id>", methods=["DELETE"])
@token_required
def delete_appointment(appointment_id, *, current_user):
    appt = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({"error": "Appointment not found"}), 404

    if appt.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    db.session.delete(appt)
    db.session.commit()

    return jsonify({"message": "Appointment deleted"})
