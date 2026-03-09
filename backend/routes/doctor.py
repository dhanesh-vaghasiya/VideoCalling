"""
Doctor routes – public listing + detail.
Prefix: /api/doctors
"""

from flask import Blueprint, request, jsonify
from model import Doctor

doctor_bp = Blueprint("doctor", __name__, url_prefix="/api/doctors")


@doctor_bp.route("", methods=["GET"])
def list_doctors():
    """Return all doctors (public endpoint – no auth required).

    Optional query params:
        ?department=Cardiology     filter by department
        ?available=true            only available doctors
    """
    query = Doctor.query

    department = request.args.get("department")
    if department:
        query = query.filter_by(department=department)

    available = request.args.get("available")
    if available is not None:
        query = query.filter_by(available=available.lower() in ("true", "1", "yes"))

    doctors = query.order_by(Doctor.full_name).all()
    return jsonify([d.to_dict() for d in doctors])


@doctor_bp.route("/<int:doctor_id>", methods=["GET"])
def get_doctor(doctor_id):
    """Return a single doctor's profile (public)."""
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404
    return jsonify(doctor.to_dict())
