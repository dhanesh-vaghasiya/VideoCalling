"""
Flask server that:
  1. Creates VideoSDK rooms via REST API
  2. Returns meetingId + token to React frontend
"""

from flask import Flask, jsonify
from flask_cors import CORS
import requests
import jwt
import datetime
import os
from dotenv import load_dotenv

# ──────────────────── INITIAL SETUP ────────────────────
load_dotenv()

app = Flask(__name__)
CORS(app)

# ──────────────────── CONFIG ────────────────────
VIDEOSDK_API_KEY = os.getenv("VIDEOSDK_API_KEY")
VIDEOSDK_SECRET_KEY = os.getenv("VIDEOSDK_SECRET_KEY")

VIDEOSDK_API_ENDPOINT = "https://api.videosdk.live/v2/rooms"


# ──────────────────── TOKEN GENERATOR ────────────────────
def generate_token():
    """Generate a fresh JWT token valid for 24 hours."""
    now = datetime.datetime.utcnow()
    exp = now + datetime.timedelta(hours=24)

    payload = {
        "apikey": VIDEOSDK_API_KEY,
        "permissions": ["allow_join"],
        "roles": ["rtc"],
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }

    token = jwt.encode(payload, VIDEOSDK_SECRET_KEY, algorithm="HS256")
    return token


# ──────────────────── ROOM CREATION ────────────────────
def create_room():
    """Create a new VideoSDK room and return the roomId."""
    token = generate_token()   # ✅ Generate token here

    headers = {
        "authorization": token,
        "Content-Type": "application/json",
    }

    response = requests.post(VIDEOSDK_API_ENDPOINT, headers=headers, json={})
    response.raise_for_status()

    return response.json()["roomId"]


# ──────────────────── ROUTES ────────────────────
@app.route("/create-meeting", methods=["POST"])
def create_meeting():
    try:
        room_id = create_room()
        token = generate_token()  # Fresh token for frontend

        return jsonify({
            "meetingId": room_id,
            "token": token
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────
if __name__ == "__main__":
    print("\nBackend running on http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
