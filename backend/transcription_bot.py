"""
Transcription Bot – joins a VideoSDK meeting as a headless participant
and saves realtime transcription text to a file.

Reference: https://docs.videosdk.live/python/guide/video-and-audio-calling/
           transcription-and-summary/realtime-transcribe-meeting
"""

import asyncio
import os
import threading
from datetime import datetime
from videosdk import (
    MeetingConfig,
    VideoSDK,
    MeetingEventHandler,
    SummaryConfig,
    TranscriptionConfig,
)

# ── Directory where transcript files are stored ──
TRANSCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "transcripts")
os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)

# ── keep track of active sessions so we can stop them later ──
active_sessions: dict = {}          # meeting_id  →  meeting object
_loops: dict = {}                   # meeting_id  →  asyncio loop
_files: dict = {}                   # meeting_id  →  file path


def _get_transcript_path(meeting_id: str) -> str:
    """Return the path such as  transcripts/<meeting_id>_<timestamp>.txt"""
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    return os.path.join(TRANSCRIPTS_DIR, f"{meeting_id}_{ts}.txt")


def _append(meeting_id: str, line: str):
    """Append a timestamped line to the meeting's transcript file."""
    path = _files.get(meeting_id)
    if not path:
        return
    ts = datetime.now().strftime("%H:%M:%S")
    with open(path, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {line}\n")


# ──────────────────── EVENT HANDLER ────────────────────
class TranscriptionEventHandler(MeetingEventHandler):
    """Handles transcription-related meeting events."""

    def __init__(self, meeting_id: str):
        super().__init__()
        self._meeting_id = meeting_id

    def on_transcription_state_changed(self, data):
        msg = f"State changed → {data}"
        print(f"\n[Transcription] {msg}\n")
        _append(self._meeting_id, msg)

    def on_transcription_text(self, data):
        print(f"\n[Transcription] {data}\n")
        # data is typically a dict with keys like participantName, text, etc.
        if isinstance(data, dict):
            name = data.get("participantName", "Unknown")
            text = data.get("text", str(data))
            _append(self._meeting_id, f"{name}: {text}")
        else:
            _append(self._meeting_id, str(data))


# ──────────────────── ASYNC CORE ────────────────────
async def _start_bot(meeting_id: str, token: str):
    """Initialise meeting, join, wait, then start transcription."""

    # Create the transcript file for this meeting
    _files[meeting_id] = _get_transcript_path(meeting_id)
    _append(meeting_id, f"=== Transcript for meeting {meeting_id} ===\n")

    meeting = VideoSDK.init_meeting(
        **MeetingConfig(
            meeting_id=meeting_id,
            name="Transcription Bot",
            mic_enabled=False,
            webcam_enabled=False,
            token=token,
        )
    )

    meeting.add_event_listener(TranscriptionEventHandler(meeting_id))
    meeting.join()

    # Give a few seconds for the meeting to fully connect
    await asyncio.sleep(5)

    config = TranscriptionConfig()
    meeting.start_transcription(config)

    active_sessions[meeting_id] = meeting
    print(f"\n[Transcription Bot] Transcription started for meeting: {meeting_id}")
    print(f"[Transcription Bot] Saving to: {_files[meeting_id]}\n")


def _run_loop(meeting_id: str, token: str):
    """Run the async bot inside its own event-loop (called from a thread)."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    _loops[meeting_id] = loop
    loop.run_until_complete(_start_bot(meeting_id, token))
    loop.run_forever()


# ──────────────────── PUBLIC API ────────────────────
def start(meeting_id: str, token: str):
    """Spawn a daemon thread that joins the meeting and starts transcription."""
    thread = threading.Thread(
        target=_run_loop,
        args=(meeting_id, token),
        daemon=True,
    )
    thread.start()
    print(f"\n[Transcription Bot] Launching for meeting: {meeting_id}\n")


def stop(meeting_id: str) -> str | None:
    """Stop transcription, leave the meeting, return the transcript file path."""
    transcript_path = _files.pop(meeting_id, None)

    meeting = active_sessions.pop(meeting_id, None)
    if meeting:
        meeting.stop_transcription()
        meeting.leave()
        print(f"\n[Transcription Bot] Stopped for meeting: {meeting_id}\n")

    loop = _loops.pop(meeting_id, None)
    if loop and loop.is_running():
        loop.call_soon_threadsafe(loop.stop)

    if transcript_path:
        # Write final marker
        ts = datetime.now().strftime("%H:%M:%S")
        with open(transcript_path, "a", encoding="utf-8") as f:
            f.write(f"\n[{ts}] === Transcription ended ===\n")
        print(f"[Transcription Bot] Transcript saved to: {transcript_path}\n")

    return transcript_path
