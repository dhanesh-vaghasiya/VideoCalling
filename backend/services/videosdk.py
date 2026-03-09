"""
VideoSDK service – token generation and room creation.
Keeps third-party API logic out of routes.
"""

import datetime
import jwt
import requests
from flask import current_app


def generate_token() -> str:
    """Generate a fresh VideoSDK JWT valid for 24 hours."""
    api_key    = current_app.config["VIDEOSDK_API_KEY"]
    secret_key = current_app.config["VIDEOSDK_SECRET_KEY"]

    now = datetime.datetime.utcnow()
    exp = now + datetime.timedelta(hours=24)

    payload = {
        "apikey":      api_key,
        "permissions": ["allow_join"],
        "roles":       ["rtc"],
        "iat":         int(now.timestamp()),
        "exp":         int(exp.timestamp()),
    }

    return jwt.encode(payload, secret_key, algorithm="HS256")


def create_room() -> str:
    """Create a new VideoSDK room and return the roomId."""
    token    = generate_token()
    endpoint = current_app.config["VIDEOSDK_API_ENDPOINT"]

    headers = {
        "authorization": token,
        "Content-Type":  "application/json",
    }

    response = requests.post(endpoint, headers=headers, json={})
    response.raise_for_status()
    return response.json()["roomId"]
