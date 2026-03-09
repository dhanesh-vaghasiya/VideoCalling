"""
Meeting routes – create VideoSDK rooms.
"""

from flask import Blueprint, jsonify, request
from services.videosdk import create_room, generate_token
from extensions import db
from model import Appointment

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

@meeting_bp.route("/generate-summary", methods=["POST"])
def generate_summary():
    """Mock LLM summarization of a meeting transcript."""
    data = request.get_json() or {}
    meeting_id = data.get("meetingId")
    transcript = data.get("transcript", "")

    if not meeting_id:
        return jsonify({"error": "meetingId is required"}), 400

    # Create mock diagnosis structure based on prompt
    summary = (
        "**Diagnosis:** Based on the transcript, a general evaluation of symptoms was performed.\\n"
        "**Medicines:** Paracetamol prescribed for 3 days.\\n"
        "**Key Points:** The patient discussed their current health concerns.\\n"
        "**Follow-ups:** Schedule a check-up in 1 week if symptoms persist."
    )

    # Save to appointment
    appointment = Appointment.query.filter_by(meeting_link=meeting_id).first()
    if appointment:
        # Only append a new summary block if there's actually a substantial new transcript
        if len(transcript.strip()) > 10:
            if appointment.meeting_summary:
                appointment.meeting_summary = appointment.meeting_summary + "\n\n---\n**Supplemental Summary (Rejoined):**\n" + summary
            else:
                appointment.meeting_summary = summary
        
        appointment.status = "Completed"
        db.session.commit()

    return jsonify({"summary": appointment.meeting_summary if appointment and appointment.meeting_summary else summary})
