"""
Database models – telemedicine / video-calling platform.
Building incrementally: starting with User only.
"""

from datetime import datetime
from extensions import db


# ═══════════════════════════════════════════════════════
#  USER
# ═══════════════════════════════════════════════════════
class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    full_name     = db.Column(db.String(120), nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    phone         = db.Column(db.String(20),  unique=True)
    password_hash = db.Column(db.String(256), nullable=False)

    role          = db.Column(db.String(20), nullable=False, default="user")   # user | doctor | admin

    # Profile fields used by current UI
    specialization = db.Column(db.String(120))   # doctor-only
    license_number = db.Column(db.String(60))    # doctor-only
    address        = db.Column(db.Text)
    city           = db.Column(db.String(80))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":             self.id,
            "fullName":       self.full_name,
            "email":          self.email,
            "phone":          self.phone,
            "role":           self.role,
            "specialization": self.specialization,
            "licenseNumber":  self.license_number,
            "address":        self.address,
            "city":           self.city,
            "createdAt":      self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<User {self.full_name} ({self.role})>"
