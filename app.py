"""
Flask server that:
  1. Creates VideoSDK rooms via REST API
  2. Serves a web UI where users can video-call in the browser
  3. Generates shareable join links for other participants
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
import requests
import jwt
import datetime
from dotenv import load_dotenv
import os

app = Flask(__name__)
load_dotenv()
# ──────────────────── CONFIG ────────────────────
VIDEOSDK_API_KEY = os.getenv('VIDEOSDK_API_KEY')
VIDEOSDK_SECRET_KEY = os.getenv('VIDEOSDK_SECRET_KEY')

def generate_token():
    """Generate a fresh JWT token that won't expire for 24 hours."""
    now = datetime.datetime.now(datetime.timezone.utc)
    exp = now + datetime.timedelta(hours=24)
    payload = {
        "apikey": VIDEOSDK_API_KEY,
        "permissions": ["allow_join"],
        "roles": ["rtc"],
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, VIDEOSDK_SECRET_KEY, algorithm="HS256")

VIDEOSDK_TOKEN = generate_token()
VIDEOSDK_API_ENDPOINT = "https://api.videosdk.live/v2/rooms"


# ──────────────── HELPER ────────────────────────
def create_room():
    print("""Create a new VideoSDK room and return the roomId.""")
    headers = {
        "authorization": VIDEOSDK_TOKEN,
        "Content-Type": "application/json",
    }
    resp = requests.post(VIDEOSDK_API_ENDPOINT, headers=headers, json={})
    resp.raise_for_status()
    return resp.json()["roomId"]


# ──────────────── ROUTES ────────────────────────
@app.route("/")
def index():
    print("""Landing page – create or join a meeting.""")
    return render_template("index.html")


@app.route("/create-meeting", methods=["POST"])
def create_meeting():
    print("""API: create a room and return its ID as JSON.""")
    room_id = create_room()
    return jsonify({"meetingId": room_id})


@app.route("/join", methods=["GET"])
def join():
    print("""Join page – users can join a meeting by visiting a URL like:
  http://localhost:5000/join
        ?meetingId=xxxx-xxxx-xxxx&name=YourName
    """)
    meeting_id = request.args.get("meetingId", "")
    name = request.args.get("name", "Guest")
    return render_template(
        "meeting.html",
        meeting_id=meeting_id,
        name=name,
        token=VIDEOSDK_TOKEN,
    )


# ────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n  Open https://localhost:5000 in your browser to start a video call\n")
    app.run(debug=True, host="0.0.0.0", port=5000,
            ssl_context=("localhost+1.pem", "localhost+1-key.pem")
            )
