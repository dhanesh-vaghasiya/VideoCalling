"""
Transcription routes – start / stop the transcription bot.
"""

from flask import Blueprint, jsonify
import transcription_bot
from services.videosdk import generate_token

transcription_bp = Blueprint("transcription", __name__, url_prefix="/api/transcription")


@transcription_bp.route("/start/<meeting_id>", methods=["POST"])
def start_transcription(meeting_id):
    """Spawn a headless bot that joins the meeting and starts transcription."""
    try:
        token = generate_token()
        transcription_bot.start(meeting_id, token)
        return jsonify({
            "status":    "Transcription started",
            "meetingId": meeting_id,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@transcription_bp.route("/stop/<meeting_id>", methods=["POST"])
def stop_transcription(meeting_id):
    """Stop transcription and remove the bot from the meeting."""
    try:
        transcription_bot.stop(meeting_id)
        return jsonify({
            "status":    "Transcription stopped",
            "meetingId": meeting_id,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
