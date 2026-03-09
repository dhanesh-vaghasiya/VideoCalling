"""
Application configuration – single source of truth for all settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""

    # ── Flask ──
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")

    # ── Database ──
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── VideoSDK ──
    VIDEOSDK_API_KEY    = os.getenv("VIDEOSDK_API_KEY")
    VIDEOSDK_SECRET_KEY = os.getenv("VIDEOSDK_SECRET_KEY")
    VIDEOSDK_API_ENDPOINT = "https://api.videosdk.live/v2/rooms"

    # ── CORS ──
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
