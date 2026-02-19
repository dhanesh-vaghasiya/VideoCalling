"""
Application factory – creates and configures the Flask app.

Run:  flask run          (uses FLASK_APP=app.py automatically)
  or: python app.py      (dev server on port 5000)
"""

from flask import Flask
from config import Config
from extensions import db, migrate, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ── Initialise extensions ──
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}})

    # ── Import models so Alembic can detect them ──
    import model  # noqa: F401

    # ── Register blueprints ──
    from routes.auth import auth_bp
    from routes.meeting import meeting_bp
    from routes.transcription import transcription_bp
    from routes.patient import patient_bp
    from routes.appointment import appointment_bp
    from routes.doctor import doctor_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(meeting_bp)
    app.register_blueprint(transcription_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(appointment_bp)
    app.register_blueprint(doctor_bp)

    from services.videosdk import create_room, generate_token
    import transcription_bot

    @app.route("/create-meeting", methods=["POST"])
    def legacy_create_meeting():
        from flask import jsonify
        try:
            room_id = create_room()
            token   = generate_token()
            return jsonify({"meetingId": room_id, "token": token})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/start-transcription/<meeting_id>", methods=["POST"])
    def legacy_start_transcription(meeting_id):
        from flask import jsonify
        try:
            token = generate_token()
            transcription_bot.start(meeting_id, token)
            return jsonify({"status": "Transcription started", "meetingId": meeting_id})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/stop-transcription/<meeting_id>", methods=["POST"])
    def legacy_stop_transcription(meeting_id):
        from flask import jsonify
        try:
            transcription_bot.stop(meeting_id)
            return jsonify({"status": "Transcription stopped", "meetingId": meeting_id})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # ── Health check ──
    @app.route("/health")
    def health():
        from flask import jsonify
        return jsonify({"status": "ok"})

    return app


# ── Dev server entry-point ──
app = create_app()

if __name__ == "__main__":
    print("\nBackend running on http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)