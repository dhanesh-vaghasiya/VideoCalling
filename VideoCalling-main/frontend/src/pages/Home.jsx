import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css"; // we will move CSS here

function Home() {
  const [name, setName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();

  const createMeeting = async () => {
    const res = await fetch("http://localhost:5000/create-meeting", {
      method: "POST",
    });

    const data = await res.json();

    navigate(`/meeting/${data.meetingId}`, {
      state: { name: name || "Guest", token: data.token },
    });
  };

  const joinMeeting = () => {
    if (!meetingId) return alert("Enter Meeting ID");

    navigate(`/meeting/${meetingId}`, {
      state: { name: name || "Guest" },
    });
  };

  return (
    <div className="container">
      <h1>Welcome to Video Call</h1>

      <input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={createMeeting}>
        Create New Meeting
      </button>

      <hr />

      <input
        placeholder="Meeting ID"
        value={meetingId}
        onChange={(e) => setMeetingId(e.target.value)}
      />

      <button onClick={joinMeeting}>
        Join Meeting
      </button>
    </div>
  );
}

export default Home;
