"""
Database models – telemedicine / video-calling platform.
Two separate schemas: User (patient/caretaker) and Doctor.
Plus: Patient (belongs to User) and Appointment (links Patient ↔ Doctor).
"""

from datetime import datetime
from typing import Optional
from extensions import db


# ═══════════════════════════════════════════════════════
#  USER  (patient / caretaker / relative)
# ═══════════════════════════════════════════════════════
class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    full_name     = db.Column(db.String(120), nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    phone         = db.Column(db.String(20),  unique=True)
    password_hash = db.Column(db.String(256), nullable=False)

    # User-specific profile fields
    address       = db.Column(db.Text)
    city          = db.Column(db.String(80))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    # Relationships
    patients     = db.relationship("Patient", backref="user", lazy="dynamic")
    appointments = db.relationship("Appointment", backref="booked_by_user", lazy="dynamic")

    @property
    def role(self):
        return "user"

    def to_dict(self):
        return {
            "id":        self.id,
            "fullName":  self.full_name,
            "email":     self.email,
            "phone":     self.phone,
            "role":      self.role,
            "address":   self.address,
            "city":      self.city,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<User {self.full_name}>"


# ═══════════════════════════════════════════════════════
#  DOCTOR
# ═══════════════════════════════════════════════════════
class Doctor(db.Model):
    __tablename__ = "doctors"

    id             = db.Column(db.Integer, primary_key=True)
    full_name      = db.Column(db.String(120), nullable=False)
    email          = db.Column(db.String(120), unique=True, nullable=False)
    phone          = db.Column(db.String(20),  unique=True)
    password_hash  = db.Column(db.String(256), nullable=False)

    # Doctor-specific profile fields
    specialization = db.Column(db.String(120))
    license_number = db.Column(db.String(60))
    qualification  = db.Column(db.String(200))
    experience     = db.Column(db.Integer, default=0)
    fee            = db.Column(db.Integer, default=0)
    available      = db.Column(db.Boolean, default=True)
    department     = db.Column(db.String(80))
    bio            = db.Column(db.Text)
    timings        = db.Column(db.String(120))
    languages      = db.Column(db.Text)            # comma-separated
    rating         = db.Column(db.Float, default=0)
    successful_patients = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    # Relationships
    appointments = db.relationship("Appointment", backref="doctor", lazy="dynamic")

    @property
    def role(self):
        return "doctor"

    def to_dict(self):
        return {
            "id":                 self.id,
            "fullName":           self.full_name,
            "name":               self.full_name,
            "email":              self.email,
            "phone":              self.phone,
            "role":               self.role,
            "specialization":     self.specialization,
            "licenseNumber":      self.license_number,
            "qualification":      self.qualification,
            "experience":         self.experience,
            "fee":                self.fee,
            "available":          self.available,
            "department":         self.department,
            "bio":                self.bio,
            "timings":            self.timings,
            "languages":          self.languages.split(",") if self.languages else [],
            "rating":             self.rating,
            "successfulPatients": self.successful_patients,
            "createdAt":          self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Doctor {self.full_name}>"


# ═══════════════════════════════════════════════════════
#  PATIENT  (belongs to a User – one user can have many patients)
# ═══════════════════════════════════════════════════════
class Patient(db.Model):
    __tablename__ = "patients"

    id        = db.Column(db.Integer, primary_key=True)
    user_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    full_name = db.Column(db.String(120), nullable=False)
    relation  = db.Column(db.String(40),  nullable=False)   # Self, Father, Mother …
    age       = db.Column(db.Integer,     nullable=False)
    gender    = db.Column(db.String(10),  nullable=False)    # Male / Female / Other

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    # Relationships
    appointments = db.relationship("Appointment", backref="patient", lazy="dynamic")

    def to_dict(self):
        return {
            "id":        self.id,
            "userId":    self.user_id,
            "fullName":  self.full_name,
            "relation":  self.relation,
            "age":       self.age,
            "gender":    self.gender,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Patient {self.full_name} (user_id={self.user_id})>"


# ═══════════════════════════════════════════════════════
#  APPOINTMENT  (links Patient ↔ Doctor, booked by a User)
# ═══════════════════════════════════════════════════════
class Appointment(db.Model):
    __tablename__ = "appointments"

    id          = db.Column(db.Integer, primary_key=True)
    patient_id  = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    doctor_id   = db.Column(db.Integer, db.ForeignKey("doctors.id"),  nullable=False)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"),    nullable=False)

    consultation_type = db.Column(db.String(40),  nullable=False)    # general, followup, specialist …
    symptoms          = db.Column(db.Text)                           # comma-separated or JSON string
    date              = db.Column(db.String(20),  nullable=False)    # YYYY-MM-DD
    time              = db.Column(db.String(10),  nullable=False)    # HH:MM
    mobile            = db.Column(db.String(20))
    status            = db.Column(db.String(20),  nullable=False, default="Pending")  # Pending / Confirmed / Completed / Cancelled

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    def to_dict(self):
        doc = Doctor.query.get(self.doctor_id)
        pat = Patient.query.get(self.patient_id)
        return {
            "id":               self.id,
            "patientId":        self.patient_id,
            "doctorId":         self.doctor_id,
            "userId":           self.user_id,
            "consultationType": self.consultation_type,
            "symptoms":         self.symptoms.split(",") if self.symptoms else [],
            "date":             self.date,
            "time":             self.time,
            "mobile":           self.mobile,
            "status":           self.status,
            "createdAt":        self.created_at.isoformat() if self.created_at else None,
            # Joined data for frontend convenience
            "patientName":      pat.full_name if pat else None,
            "patientAge":       pat.age if pat else None,
            "patientGender":    pat.gender if pat else None,
            "relation":         pat.relation if pat else None,
            "doctor":           doc.full_name if doc else None,
            "specialization":   doc.specialization if doc else None,
        }

    def __repr__(self):
        return f"<Appointment {self.id} patient={self.patient_id} doctor={self.doctor_id} {self.status}>"


# ═══════════════════════════════════════════════════════
#  HELPER – look up any account by role + id
# ═══════════════════════════════════════════════════════
def get_account_by_role(role: str, account_id: int):
    """Return User or Doctor instance (or None)."""
    if role == "doctor":
        return Doctor.query.get(account_id)
    return User.query.get(account_id)


def find_account_by_email(email: str, role: Optional[str] = None):
    """Search for an account by email. If role is given, search only that table."""
    if role == "doctor":
        return Doctor.query.filter_by(email=email).first()
    if role == "user":
        return User.query.filter_by(email=email).first()
    # No role hint – check both tables
    return User.query.filter_by(email=email).first() or \
           Doctor.query.filter_by(email=email).first()
