"""
seed.py – Populate the database with dummy data for testing.

Run:  cd backend && python seed.py
"""

from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from app import create_app
from extensions import db
from model import User, Doctor, Patient, Appointment

app = create_app()

# ── Dummy data ──────────────────────────────────────────

USERS = [
    {"full_name": "Aarav Mehta",   "email": "aarav@test.com",   "phone": "9876543210", "password": "test1234", "address": "12 MG Road",    "city": "Mumbai"},
    {"full_name": "Sita Verma",    "email": "sita@test.com",    "phone": "9876543211", "password": "test1234", "address": "56 Park Street", "city": "Kolkata"},
    {"full_name": "Ravi Kumar",    "email": "ravi@test.com",    "phone": "9876543212", "password": "test1234", "address": "78 Brigade Rd",  "city": "Bangalore"},
]

DOCTORS = [
    {
        "full_name": "Dr. Ananya Sharma",
        "email": "ananya@hospital.com",
        "phone": "9000000001",
        "password": "doc1234",
        "specialization": "General Physician",
        "license_number": "MCI-GP-1001",
        "qualification": "MBBS, MD (Internal Medicine)",
        "experience": 12,
        "fee": 500,
        "available": True,
        "department": "General Medicine",
        "bio": "Dr. Ananya Sharma is a highly experienced general physician specializing in preventive care, chronic disease management, and acute illnesses. She is known for her compassionate approach and thorough diagnostics.",
        "timings": "Mon–Sat, 9:00 AM – 1:00 PM",
        "languages": "English,Hindi",
        "rating": 4.8,
        "successful_patients": 4200,
    },
    {
        "full_name": "Dr. Rajesh Patel",
        "email": "rajesh@hospital.com",
        "phone": "9000000002",
        "password": "doc1234",
        "specialization": "Cardiology",
        "license_number": "MCI-CD-2002",
        "qualification": "MBBS, DM (Cardiology), FACC",
        "experience": 18,
        "fee": 800,
        "available": True,
        "department": "Cardiology",
        "bio": "Dr. Rajesh Patel is a senior interventional cardiologist with expertise in angioplasty, bypass surgery consultation, and heart failure management. He has performed over 3,000 cardiac procedures.",
        "timings": "Mon–Fri, 10:00 AM – 4:00 PM",
        "languages": "English,Hindi,Gujarati",
        "rating": 4.9,
        "successful_patients": 6800,
    },
    {
        "full_name": "Dr. Priya Menon",
        "email": "priya@hospital.com",
        "phone": "9000000003",
        "password": "doc1234",
        "specialization": "Dermatology",
        "license_number": "MCI-DM-3003",
        "qualification": "MBBS, MD (Dermatology), DNB",
        "experience": 10,
        "fee": 600,
        "available": False,
        "department": "Dermatology",
        "bio": "Dr. Priya Menon is a board-certified dermatologist treating skin conditions including eczema, psoriasis, acne, and cosmetic dermatology. She is currently on sabbatical leave.",
        "timings": "Currently Unavailable",
        "languages": "English,Hindi,Malayalam",
        "rating": 4.7,
        "successful_patients": 3500,
    },
    {
        "full_name": "Dr. Vikram Singh",
        "email": "vikram@hospital.com",
        "phone": "9000000004",
        "password": "doc1234",
        "specialization": "Orthopedics",
        "license_number": "MCI-OR-4004",
        "qualification": "MBBS, MS (Orthopedics), Fellowship in Joint Replacement",
        "experience": 15,
        "fee": 700,
        "available": True,
        "department": "Orthopedics",
        "bio": "Dr. Vikram Singh is a renowned orthopedic surgeon specializing in joint replacements, sports injuries, and spinal surgery. He has introduced minimally invasive techniques at Nova Hospital.",
        "timings": "Mon–Sat, 11:00 AM – 5:00 PM",
        "languages": "English,Hindi,Punjabi",
        "rating": 4.8,
        "successful_patients": 5100,
    },
    {
        "full_name": "Dr. Neha Gupta",
        "email": "neha@hospital.com",
        "phone": "9000000005",
        "password": "doc1234",
        "specialization": "Pediatrics",
        "license_number": "MCI-PD-5005",
        "qualification": "MBBS, MD (Pediatrics), IAP Fellow",
        "experience": 8,
        "fee": 550,
        "available": True,
        "department": "Pediatrics",
        "bio": "Dr. Neha Gupta is a compassionate pediatrician with expertise in neonatal care, childhood infections, vaccination programs, and developmental assessments for children aged 0–14 years.",
        "timings": "Mon–Fri, 9:00 AM – 2:00 PM",
        "languages": "English,Hindi",
        "rating": 4.9,
        "successful_patients": 2800,
    },
    {
        "full_name": "Dr. Arjun Reddy",
        "email": "arjun@hospital.com",
        "phone": "9000000006",
        "password": "doc1234",
        "specialization": "Neurology",
        "license_number": "MCI-NR-6006",
        "qualification": "MBBS, DM (Neurology), FRCP",
        "experience": 20,
        "fee": 900,
        "available": True,
        "department": "Neurology",
        "bio": "Dr. Arjun Reddy is the Head of Neurology at Nova Hospital. He specializes in stroke treatment, epilepsy management, and neurodegenerative disorders with over two decades of clinical experience.",
        "timings": "Mon–Fri, 10:00 AM – 3:00 PM",
        "languages": "English,Hindi,Telugu",
        "rating": 4.9,
        "successful_patients": 7200,
    },
    {
        "full_name": "Dr. Fatima Khan",
        "email": "fatima@hospital.com",
        "phone": "9000000007",
        "password": "doc1234",
        "specialization": "Gynecology & Obstetrics",
        "license_number": "MCI-GY-7007",
        "qualification": "MBBS, MS (OB-GYN), FRCOG",
        "experience": 14,
        "fee": 650,
        "available": True,
        "department": "Gynecology",
        "bio": "Dr. Fatima Khan is a senior gynecologist and obstetrician specializing in high-risk pregnancies, laparoscopic surgeries, and fertility treatments. She is dedicated to women's health and wellness.",
        "timings": "Mon–Sat, 9:30 AM – 3:30 PM",
        "languages": "English,Hindi,Urdu",
        "rating": 4.8,
        "successful_patients": 4600,
    },
    {
        "full_name": "Dr. Suresh Iyer",
        "email": "suresh@hospital.com",
        "phone": "9000000008",
        "password": "doc1234",
        "specialization": "Psychiatry",
        "license_number": "MCI-PS-8008",
        "qualification": "MBBS, MD (Psychiatry), MRCPsych",
        "experience": 11,
        "fee": 750,
        "available": True,
        "department": "Mental Health",
        "bio": "Dr. Suresh Iyer is a consultant psychiatrist specializing in anxiety, depression, bipolar disorder, and addiction recovery. He practices evidence-based therapy integrated with medication management.",
        "timings": "Tue–Sat, 11:00 AM – 6:00 PM",
        "languages": "English,Hindi,Tamil",
        "rating": 4.7,
        "successful_patients": 3100,
    },
]

# Patients for each user (user index → list of patients)
PATIENTS = {
    0: [  # Aarav's family
        {"full_name": "Aarav Mehta",    "relation": "Self",   "age": 28, "gender": "Male"},
        {"full_name": "Meera Mehta",    "relation": "Mother", "age": 55, "gender": "Female"},
        {"full_name": "Rohan Mehta",    "relation": "Father", "age": 60, "gender": "Male"},
    ],
    1: [  # Sita's family
        {"full_name": "Sita Verma",     "relation": "Self",     "age": 32, "gender": "Female"},
        {"full_name": "Arjun Verma",    "relation": "Son",      "age": 5,  "gender": "Male"},
    ],
    2: [  # Ravi's family
        {"full_name": "Ravi Kumar",     "relation": "Self",     "age": 40, "gender": "Male"},
        {"full_name": "Priya Kumar",    "relation": "Spouse",   "age": 37, "gender": "Female"},
        {"full_name": "Anita Devi",     "relation": "Mother",   "age": 65, "gender": "Female"},
        {"full_name": "Kiran Kumar",    "relation": "Daughter", "age": 10, "gender": "Female"},
    ],
}

# Appointments: (user_idx, patient_idx, doctor_idx, consult, symptoms, date_offset_days, time, status)
APPOINTMENTS = [
    (0, 0, 0, "General Consultation",     "Fever,Cough",            0, "09:00", "Pending"),
    (0, 1, 1, "Specialist Consultation",   "Chest Pain",             0, "10:30", "Confirmed"),
    (0, 2, 3, "Follow-up Visit",           "Joint Pain,Back Pain",  -2, "14:00", "Completed"),
    (1, 0, 0, "General Consultation",      "Cold,Headache",          0, "11:00", "Pending"),
    (1, 1, 4, "Child / Pediatric",         "Fever,Cough",            1, "09:30", "Pending"),
    (2, 0, 1, "Specialist Consultation",   "Chest Pain,Fatigue",    -1, "10:00", "Confirmed"),
    (2, 1, 2, "Specialist Consultation",   "Skin Rash,Itching",      0, "15:00", "Pending"),
    (2, 2, 0, "General Consultation",      "Body Ache,Fatigue",     -5, "09:00", "Completed"),
    (2, 3, 4, "Child / Pediatric",         "Fever,Stomach Ache",     2, "11:00", "Pending"),
    (0, 0, 0, "Mental Health Consultation","Anxiety,Insomnia",       3, "16:00", "Pending"),
]


def seed():
    with app.app_context():
        print("🗑️  Clearing existing data …")
        Appointment.query.delete()
        Patient.query.delete()
        User.query.delete()
        Doctor.query.delete()
        db.session.commit()

        # ── Users ──
        users = []
        for u in USERS:
            user = User(
                full_name=u["full_name"],
                email=u["email"],
                phone=u["phone"],
                password_hash=generate_password_hash(u["password"]),
                address=u["address"],
                city=u["city"],
            )
            db.session.add(user)
            users.append(user)
        db.session.flush()  # get IDs
        print(f"✅  Created {len(users)} users")

        # ── Doctors ──
        doctors = []
        for d in DOCTORS:
            doctor = Doctor(
                full_name=d["full_name"],
                email=d["email"],
                phone=d["phone"],
                password_hash=generate_password_hash(d["password"]),
                specialization=d["specialization"],
                license_number=d["license_number"],
                qualification=d.get("qualification"),
                experience=d.get("experience", 0),
                fee=d.get("fee", 0),
                available=d.get("available", True),
                department=d.get("department"),
                bio=d.get("bio"),
                timings=d.get("timings"),
                languages=d.get("languages"),
                rating=d.get("rating", 0),
                successful_patients=d.get("successful_patients", 0),
            )
            db.session.add(doctor)
            doctors.append(doctor)
        db.session.flush()
        print(f"✅  Created {len(doctors)} doctors")

        # ── Patients ──
        patient_map = {}  # (user_idx, patient_idx) → Patient instance
        total_patients = 0
        for user_idx, patient_list in PATIENTS.items():
            for pat_idx, p in enumerate(patient_list):
                patient = Patient(
                    user_id=users[user_idx].id,
                    full_name=p["full_name"],
                    relation=p["relation"],
                    age=p["age"],
                    gender=p["gender"],
                )
                db.session.add(patient)
                patient_map[(user_idx, pat_idx)] = patient
                total_patients += 1
        db.session.flush()
        print(f"✅  Created {total_patients} patients")

        # ── Appointments ──
        today = datetime.utcnow().date()
        for a in APPOINTMENTS:
            user_idx, pat_idx, doc_idx, consult, symptoms, day_offset, time_str, status = a
            appt_date = today + timedelta(days=day_offset)
            appointment = Appointment(
                patient_id=patient_map[(user_idx, pat_idx)].id,
                doctor_id=doctors[doc_idx].id,
                user_id=users[user_idx].id,
                consultation_type=consult,
                symptoms=symptoms,
                date=appt_date.strftime("%Y-%m-%d"),
                time=time_str,
                mobile=USERS[user_idx]["phone"],
                status=status,
            )
            db.session.add(appointment)
        db.session.commit()
        print(f"✅  Created {len(APPOINTMENTS)} appointments")

        # ── Summary ──
        print("\n────────────────────────────────────────")
        print("  TEST CREDENTIALS")
        print("────────────────────────────────────────")
        print("  USERS  (role: user)")
        for u in USERS:
            print(f"    {u['email']}  /  {u['password']}")
        print()
        print("  DOCTORS  (role: doctor)")
        for d in DOCTORS:
            print(f"    {d['email']}  /  {d['password']}")
        print("────────────────────────────────────────\n")


if __name__ == "__main__":
    seed()
