import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateAppointmentStatus } from '../services/appointment';
import './People.css';

const People = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = location.state || {}; // Safely access user data

    // Set initial values from the database object if available
    const [scheduled, setScheduled] = useState(user?.status === 'Scheduled' || !!user?.meetingLink);
    const [meetingLink, setMeetingLink] = useState(user?.meetingLink || '');
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        if (!user || (!user.requestDate && !user.date) || (!user.requestTime && !user.time)) return;
        const reqDate = user.requestDate || user.date;
        const reqTime = user.requestTime || user.time;
        // Basic parsing for date & time
        const targetTime = new Date(`${reqDate} ${reqTime}`).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetTime - now;

            if (distance < 0) {
                setCountdown("Ready to join!");
                clearInterval(interval);
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((distance % (1000 * 60)) / 1000);
                setCountdown(`Starts in: ${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${secs}s`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [user]);
    if (!user) {
        return (
            <div className="people-container">
                <h2>No User Selected</h2>
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    const handleSchedule = async () => {
        try {
            const updatedAppt = await updateAppointmentStatus(user.id, 'Scheduled');
            setScheduled(true);
            setMeetingLink(updatedAppt.meetingLink);
            alert(`Meeting Scheduled!`);
        } catch (err) {
            console.error(err);
            alert("Failed to schedule: " + err.message);
        }
    };

    const handleJoinMeeting = () => {
        if (!meetingLink) return;
        navigate(`/meeting/${meetingLink}`, { state: { name: 'Doctor' } });
    };

    return (
        <div className="people-container">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
            </button>

            <div className="profile-card">
                <header className="profile-header">
                    <div>
                        <h1>{user.name}</h1>
                        <div className="patient-id">ID: #{user.id.toString().padStart(4, '0')}</div>
                    </div>
                    <div className={`status-badge status-${scheduled ? 'scheduled' : user.status.toLowerCase()}`}>
                        {scheduled ? 'Scheduled' : user.status}
                    </div>
                </header>

                <div className="info-grid">
                    <div className="info-group">
                        <span className="label">Personal Info</span>
                        <span className="value">{user.age} Years • {user.gender}</span>
                    </div>
                    <div className="info-group">
                        <span className="label">Contact</span>
                        <span className="value">{user.phone}</span>
                        <span className="value" style={{ fontSize: '0.9rem' }}>{user.email}</span>
                    </div>
                    <div className="info-group">
                        <span className="label">Requested Time</span>
                        <span className="value">{user.requestDate}</span>
                        <span className="value">{user.requestTime}</span>
                    </div>
                </div>

                <div className="medical-section">
                    <div className="info-group" style={{ marginBottom: '1.5rem' }}>
                        <span className="label">Reason for Visit</span>
                        <span className="value">{user.reason}</span>
                    </div>

                    <div className="info-group">
                        <span className="label">Medical History</span>
                        <span className="value">{user.medicalHistory}</span>
                    </div>
                </div>

                <div className="medical-section">
                    <h3>Uploaded Reports</h3>
                    {user.reports && user.reports.length > 0 ? (
                        <ul className="reports-list">
                            {user.reports.map((report, index) => (
                                <li key={index} className="report-item">
                                    <span className="file-icon">📄</span>
                                    <a href="#" className="file-name" onClick={(e) => e.preventDefault()}>
                                        {report}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#888', fontStyle: 'italic' }}>No reports uploaded.</p>
                    )}
                </div>

                <div className="action-section">
                    {scheduled ? (
                        <div className="confirmation-msg">
                            <span style={{ display: 'block', marginBottom: '10px' }}>✓ Meeting Scheduled! {countdown}</span>
                            <button className="schedule-btn" style={{ backgroundColor: '#28a745' }} onClick={handleJoinMeeting}>
                                Join Video Call
                            </button>
                        </div>
                    ) : (
                        <button
                            className="schedule-btn"
                            onClick={handleSchedule}
                            disabled={user.status === 'Scheduled'}
                        >
                            Schedule Meeting
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default People;
