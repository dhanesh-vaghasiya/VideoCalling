"""
Patient routes – CRUD for patients belonging to the authenticated user.
Prefix: /api/patients
"""

from flask import Blueprint, request, jsonify
from extensions import db
from model import Patient
from middleware.auth import token_required

patient_bp = Blueprint("patient", __name__, url_prefix="/api/patients")


# ── List patients for the current user ──
@patient_bp.route("", methods=["GET"])
@token_required
def list_patients(*, current_user):
    """Return all patients registered by this user."""
    patients = Patient.query.filter_by(user_id=current_user.id).order_by(
        Patient.created_at.desc()
    ).all()
    return jsonify([p.to_dict() for p in patients])


# ── Create a new patient ──
@patient_bp.route("", methods=["POST"])
@token_required
def create_patient(*, current_user):
    """Register a new patient under the authenticated user."""
    data = request.get_json() or {}

    required = ("fullName", "relation", "age", "gender")
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    patient = Patient(
        user_id   = current_user.id,
        full_name = data["fullName"].strip(),
        relation  = data["relation"].strip(),
        age       = int(data["age"]),
        gender    = data["gender"].strip(),
    )

    db.session.add(patient)
    db.session.commit()

    return jsonify(patient.to_dict()), 201


# ── Get single patient ──
@patient_bp.route("/<int:patient_id>", methods=["GET"])
@token_required
def get_patient(patient_id, *, current_user):
    patient = Patient.query.filter_by(id=patient_id, user_id=current_user.id).first()
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    return jsonify(patient.to_dict())


# ── Update patient ──
@patient_bp.route("/<int:patient_id>", methods=["PUT"])
@token_required
def update_patient(patient_id, *, current_user):
    patient = Patient.query.filter_by(id=patient_id, user_id=current_user.id).first()
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    data = request.get_json() or {}
    if data.get("fullName"):
        patient.full_name = data["fullName"].strip()
    if data.get("relation"):
        patient.relation = data["relation"].strip()
    if data.get("age"):
        patient.age = int(data["age"])
    if data.get("gender"):
        patient.gender = data["gender"].strip()

    db.session.commit()
    return jsonify(patient.to_dict())


# ── Delete patient ──
@patient_bp.route("/<int:patient_id>", methods=["DELETE"])
@token_required
def delete_patient(patient_id, *, current_user):
    patient = Patient.query.filter_by(id=patient_id, user_id=current_user.id).first()
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    db.session.delete(patient)
    db.session.commit()
    return jsonify({"message": "Patient deleted"})
