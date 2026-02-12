import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./meeting.css";

function Meeting() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const videoGridRef = useRef(null);

  const name = location.state?.name || "Guest";
  const token = location.state?.token;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.videosdk.live/js-sdk/0.1.6/videosdk.js";
    script.async = true;

    script.onload = () => {
      startMeeting();
    };

    document.body.appendChild(script);
  }, []);

  const createTile = (participant, isLocal) => {
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    if (isLocal) video.muted = true;

    const tile = document.createElement("div");
    tile.className = "video-tile";
    tile.appendChild(video);

    videoGridRef.current.appendChild(tile);

    participant.on("stream-enabled", (stream) => {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(stream.track);
      video.srcObject = mediaStream;
    });

    participant.on("stream-disabled", () => {
      video.srcObject = null;
    });
  };

  const startMeeting = () => {
    window.VideoSDK.config(token);

    const meeting = window.VideoSDK.initMeeting({
      meetingId: id,
      name: name,
      micEnabled: true,
      webcamEnabled: true,
    });

    meeting.on("meeting-joined", () => {
      createTile(meeting.localParticipant, true);
    });

    meeting.on("participant-joined", (participant) => {
      createTile(participant, false);
    });

    meeting.join();

    document.getElementById("leaveBtn").onclick = () => {
      meeting.leave();
      navigate("/");
    };
  };

  return (
    <div className="meeting-container">
      <h2>Meeting ID: {id}</h2>

      <div ref={videoGridRef} className="video-grid"></div>

      <button id="leaveBtn">Leave</button>
    </div>
  );
}

export default Meeting;
