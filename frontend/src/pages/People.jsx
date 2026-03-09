import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './People.css';

const People = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = location.state || {}; // Safely access user data
    const [scheduled, setScheduled] = useState(false);

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

    const handleSchedule = () => {
        // Update in localStorage
        const allRequests = JSON.parse(localStorage.getItem('hospitalRequests') || '[]');
        const updatedRequests = allRequests.map(req => {
            if (req.id === user.id) {
                return { ...req, status: 'Scheduled' };
            }
            return req;
        });
        localStorage.setItem('hospitalRequests', JSON.stringify(updatedRequests));

        // Create Meeting ID
        const meetingId = `MEETING-${Date.now()}`;

        // Simulate API call
        setTimeout(() => {
            setScheduled(true);
            alert(`Meeting Scheduled! ID: ${meetingId}`);
            // Optionally auto-create meeting link here
        }, 500);
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
                            ✓ Meeting Scheduled Successfully!
                        </div>
                    ) : (
                        <button
                            className="schedule-btn"
                            onClick={handleSchedule}
                            disabled={user.status === 'Scheduled'}
                        >
                            {user.status === 'Scheduled' ? 'Already Scheduled' : 'Schedule Meeting'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default People;
