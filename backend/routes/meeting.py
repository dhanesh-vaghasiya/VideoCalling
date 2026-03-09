"""
Meeting routes – create VideoSDK rooms.
"""

from flask import Blueprint, jsonify
from services.videosdk import create_room, generate_token

meeting_bp = Blueprint("meeting", __name__, url_prefix="/api/meeting")


@meeting_bp.route("/create", methods=["POST"])
def create_meeting():
    """Create a new VideoSDK room and return meetingId + token."""
    try:
        room_id = create_room()
        token   = generate_token()

        return jsonify({
            "meetingId": room_id,
            "token":     token,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
