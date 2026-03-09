import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import "./meeting.css";
import ReactMarkdown from 'react-markdown';

const API_BASE = "http://localhost:5000";

function Meeting() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const videoGridRef = useRef(null);
  const meetingRef = useRef(null);
  const tilesRef = useRef({});           // participantId → DOM node

  const name = location.state?.name || "Guest";
  const passedToken = location.state?.token;

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showSummarizeView, setShowSummarizeView] = useState(false);
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");
  const [summaryCountdown, setSummaryCountdown] = useState(60); // 1 minute
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryResult, setSummaryResult] = useState("");

  /* ── Fetch a fresh token if we don't already have one (join flow) ── */
  const getToken = useCallback(async () => {
    if (passedToken) return passedToken;
    try {
      const res = await fetch(`${API_BASE}/create-meeting`, { method: "POST" });
      const data = await res.json();
      return data.token;
    } catch {
      setError("Could not reach the server for a token.");
      return null;
    }
  }, [passedToken]);

  /* ── Create a video tile for a participant ── */
  const createTile = useCallback((participant, isLocal) => {
    if (tilesRef.current[participant.id]) return;  // already exists

    const tile = document.createElement("div");
    tile.className = "video-tile";
    tile.id = `tile-${participant.id}`;

    // Avatar fallback when cam is off
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = (participant.displayName || "?")[0];
    tile.appendChild(avatar);

    // Video element
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    if (isLocal) video.muted = true;
    video.style.display = "none";
    tile.appendChild(video);

    // Name label
    const label = document.createElement("div");
    label.className = "label";
    const dot = document.createElement("span");
    dot.className = "status-icon";
    label.appendChild(dot);
    label.append(participant.displayName || (isLocal ? name : "Guest"));
    if (isLocal) label.append(" (You)");
    tile.appendChild(label);

    videoGridRef.current?.appendChild(tile);
    tilesRef.current[participant.id] = tile;

    // Update grid count for CSS grid rules
    updateGridCount();

    participant.on("stream-enabled", (stream) => {
      if (stream.kind === "video") {
        const ms = new MediaStream();
        ms.addTrack(stream.track);
        video.srcObject = ms;
        video.style.display = "block";
        avatar.style.display = "none";
      }
      if (stream.kind === "audio" && !isLocal) {
        const audio = document.createElement("audio");
        audio.autoplay = true;
        const ms = new MediaStream();
        ms.addTrack(stream.track);
        audio.srcObject = ms;
        tile.appendChild(audio);
      }
    });

    participant.on("stream-disabled", (stream) => {
      if (stream.kind === "video") {
        video.srcObject = null;
        video.style.display = "none";
        avatar.style.display = "flex";
      }
    });
  }, [name]);

  /* ── Remove tile when a participant leaves ── */
  const removeTile = useCallback((participantId) => {
    const tile = tilesRef.current[participantId];
    if (tile) {
      tile.remove();
      delete tilesRef.current[participantId];
    }
    updateGridCount();
  }, []);

  const updateGridCount = () => {
    if (videoGridRef.current) {
      const count = videoGridRef.current.children.length;
      videoGridRef.current.setAttribute("data-count", count);
    }
  };

  /* ── Speech Recognition ── */
  useEffect(() => {
    if (joined && !showSummarizeView) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            transcriptRef.current += finalTranscript;
            setTranscript(transcriptRef.current);
          }
        };

        try {
          recognition.start();
        } catch (e) { /* ignore already started error */ }

        return () => {
          try {
            recognition.stop();
          } catch (e) { }
        };
      }
    }
  }, [joined, showSummarizeView]);

  /* ── Initialise & join meeting ── */
  useEffect(() => {
    let scriptEl;
    let cancelled = false;

    const init = async () => {
      // Load VideoSDK script
      await new Promise((resolve, reject) => {
        if (window.VideoSDK) return resolve();
        scriptEl = document.createElement("script");
        scriptEl.src = "https://sdk.videosdk.live/js-sdk/0.1.6/videosdk.js";
        scriptEl.async = true;
        scriptEl.onload = resolve;
        scriptEl.onerror = () => reject(new Error("Failed to load VideoSDK"));
        document.body.appendChild(scriptEl);
      });

      if (cancelled) return;

      const token = await getToken();
      if (!token || cancelled) return;

      window.VideoSDK.config(token);

      const meeting = window.VideoSDK.initMeeting({
        meetingId: id,
        name,
        micEnabled: true,
        webcamEnabled: true,
      });

      meetingRef.current = meeting;

      meeting.on("meeting-joined", () => {
        if (cancelled) return;
        setJoined(true);
        setLoading(false);
        createTile(meeting.localParticipant, true);
        setParticipantCount(meeting.participants.size + 1);
      });

      meeting.on("participant-joined", (participant) => {
        createTile(participant, false);
        setParticipantCount((c) => c + 1);
      });

      meeting.on("participant-left", (participant) => {
        removeTile(participant.id);
        setParticipantCount((c) => Math.max(0, c - 1));
      });

      meeting.on("meeting-left", () => {
        // Do not navigate immediately so the post-meeting Summarize View can display.
        setShowSummarizeView(true);
      });

      meeting.on("error", (err) => {
        console.error("Meeting error:", err);
        setError(err.message || "Meeting error");
        setLoading(false);
      });

      meeting.join();
    };

    init().catch((e) => {
      setError(e.message);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      meetingRef.current?.leave();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Controls ── */
  const toggleMic = () => {
    if (!meetingRef.current) return;
    if (micOn) meetingRef.current.muteMic();
    else meetingRef.current.unmuteMic();
    setMicOn((v) => !v);
  };

  const toggleCam = () => {
    if (!meetingRef.current) return;
    if (camOn) meetingRef.current.disableWebcam();
    else meetingRef.current.enableWebcam();
    setCamOn((v) => !v);
  };

  const leaveMeeting = () => {
    meetingRef.current?.leave();
    setShowSummarizeView(true);
  };

  /* ── Summarize View Handlers ── */
  useEffect(() => {
    if (showSummarizeView && !summaryResult && !isGenerating) {
      handleGenerateSummary();
    }
  }, [showSummarizeView, summaryResult, isGenerating]);

  const handleGenerateSummary = async () => {

    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/meeting/generate-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: id,
          transcript: transcriptRef.current
        })
      });
      const data = await res.json();
      setSummaryResult(data.summary || "Summary generated (empty).");
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setSummaryResult("Failed to generate summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(id);
  };

  /* ── Render ── */
  if (showSummarizeView) {
    return (
      <div className="meeting-page">
        <div className="empty-state" style={{ maxWidth: "800px", padding: "40px" }}>
          <h2 style={{ marginBottom: "20px" }}>Post-Meeting Summary</h2>
          {summaryResult ? (
            <div className="summary-result markdown-content" style={{ textAlign: "left", padding: "20px", background: "white", borderRadius: "8px", color: "#333", whiteSpace: "normal", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", lineHeight: "1.6" }}>
              <ReactMarkdown>{summaryResult.replace(/\\n/g, '\n')}</ReactMarkdown>
            </div>
          ) : (
            <div>
              <p style={{ color: "var(--text-secondary)" }}>Generating meeting summary...</p>
              <div className="spinner" style={{ margin: "20px auto", width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid var(--primary-color)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          <div style={{ marginTop: "40px" }}>
            <button className="ctrl-btn leave" onClick={() => navigate("/")} style={{ background: "transparent", color: "var(--danger-color)", border: "1px solid var(--danger-color)" }}>
              Back to Dashboard
            </button>
          </div>

        </div>
      </div >
    );
  }

  if (error) {
    return (
      <div className="meeting-page">
        <div className="empty-state">
          <p>⚠️ {error}</p>
          <button className="ctrl-btn leave" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-page">
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo-small">📹</div>
          <span className="meeting-title">Video Call</span>
        </div>
        <div className="topbar-right">
          <div className="meeting-info" onClick={copyMeetingId} title="Click to copy">
            ID: <span className="meeting-id">{id}</span> 📋
          </div>
          <div className="participants-count">
            👥 {participantCount}
          </div>
        </div>
      </div>

      {/* Video grid */}
      {loading && (
        <div className="empty-state loading">
          <p>Connecting to meeting…</p>
        </div>
      )}
      <div
        ref={videoGridRef}
        className="video-grid"
        data-count="0"
        style={{ display: loading ? "none" : undefined }}
      />

      {/* Controls bar */}
      {joined && (
        <div className="controls">
          <button
            className={`ctrl-btn ${micOn ? "on" : "off"}`}
            onClick={toggleMic}
            title={micOn ? "Mute" : "Unmute"}
          >
            {micOn ? "🎙️" : "🔇"}
          </button>

          <button
            className={`ctrl-btn ${camOn ? "on" : "off"}`}
            onClick={toggleCam}
            title={camOn ? "Turn off camera" : "Turn on camera"}
          >
            {camOn ? "📷" : "📷‍🚫"}
          </button>

          <div className="ctrl-divider" />

          <button className="ctrl-btn leave" onClick={leaveMeeting}>
            📞 Leave
          </button>
        </div>
      )}
    </div>
  );
}

export default Meeting;
