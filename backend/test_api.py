import requests
import json

base_url = "http://localhost:5000/api"

# Need to login first to get token
# Let's see if we have an existing user to login
print("Creating test user if needed...")
res = requests.post(f"{base_url}/auth/signup", json={
    "fullName": "Test User",
    "email": "testuser99@example.com",
    "password": "password123",
    "role": "user"
})
print(res.status_code, res.text)

res = requests.post(f"{base_url}/auth/login", json={
    "email": "testuser99@example.com",
    "password": "password123",
    "role": "user"
})
print("Login:", res.status_code, res.text)
token = res.json().get("accessToken")
headers = {"Authorization": f"Bearer {token}"}

print("Creating patient...")
patient_res = requests.post(f"{base_url}/patients", json={
    "fullName": "Test Patient",
    "relation": "Self",
    "age": "30",
    "gender": "Male"
}, headers=headers)

print(patient_res.status_code, patient_res.text)

if patient_res.status_code == 201:
    patient_id = patient_res.json()["id"]
    
    # We need a doctor first
    print("Getting doctors...")
    doc_res = requests.get(f"{base_url}/doctors", headers=headers)
    print(doc_res.status_code, doc_res.text)
    if doc_res.status_code == 200 and len(doc_res.json()) > 0:
        doc_id = doc_res.json()[0]["id"]
        
        print("Creating appointment...")
        appt_res = requests.post(f"{base_url}/appointments", json={
            "patientId": patient_id,
            "doctorId": doc_id,
            "consultationType": "General",
            "symptoms": ["headache"],
            "date": "2026-03-06",
            "time": "10:00",
            "mobile": "9999999999",
            "razorpayPaymentId": "simulated_payment",
            "razorpayOrderId": "simulated_order",
            "razorpaySignature": "simulated_signature"
        }, headers=headers)
        print("Appointment:", appt_res.status_code)
        with open("error.html", "w", encoding="utf-8") as f:
            f.write(appt_res.text)
        print("Wrote to error.html")
    else:
        print("No doctors found")
