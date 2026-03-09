import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getAuthData } from '../services/auth';
import { getAppointments, updateAppointmentStatus } from '../services/appointment';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [doctorName, setDoctorName] = useState('Dr. Smith');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // --- MOCK DATA ---
    const initialStats = {
        totalPatients: 1240,
        todayAppointments: 8,
        pendingRequests: 12,
        consultations: 45
    };

    const initialSchedule = [
        { id: 201, time: '09:00 AM', name: 'Alice Williams', reason: 'Routine Checkup', status: 'Confirmed' },
        { id: 202, time: '10:30 AM', name: 'Robert Brown', reason: 'Post-Surgery Follow-up', status: 'Confirmed' },
        { id: 203, time: '01:00 PM', name: 'Emily Davis', reason: 'Vaccination', status: 'Confirmed' }
    ];

    const initialHistory = [
        { id: 301, date: '2023-10-24', name: 'Michael Scott', diagnosis: 'Flu', status: 'Completed' },
        { id: 302, date: '2023-10-23', name: 'Pam Beesly', diagnosis: 'Migraine', status: 'Completed' },
        { id: 303, date: '2023-10-22', name: 'Jim Halpert', diagnosis: 'Hypertension', status: 'Completed' },
        { id: 304, date: '2023-10-21', name: 'Dwight Schrute', diagnosis: 'Allergy', status: 'Completed' },
        { id: 305, date: '2023-10-20', name: 'Angela Martin', diagnosis: 'Checkup', status: 'Completed' }
    ];

    // State
    const [stats, setStats] = useState(initialStats);
    const [schedule, setSchedule] = useState(initialSchedule);
    const [history, setHistory] = useState(initialHistory);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        // Load User from auth data
        const { user } = getAuthData();
        if (user && user.role === 'doctor') {
            setDoctorName(user.fullName || user.name || 'Doctor');
        }

        // Fetch real appointments from the API
        getAppointments()
            .then((data) => {
                setRequests(data);

                // Build schedule from today's confirmed appointments
                const today = new Date().toISOString().split('T')[0];
                const todayAppts = data.filter(
                    (a) => a.date === today && a.status === 'Confirmed'
                );
                setSchedule(
                    todayAppts.map((a) => ({
                        id: a.id,
                        time: a.time,
                        name: a.patientName,
                        reason: a.consultationType,
                        status: a.status,
                    }))
                );

                // Build history from completed appointments
                const completedAppts = data.filter((a) => a.status === 'Completed');
                setHistory(
                    completedAppts.slice(0, 5).map((a) => ({
                        id: a.id,
                        date: a.date,
                        name: a.patientName,
                        diagnosis: a.consultationType,
                        status: a.status,
                    }))
                );

                // Update stats
                const pending = data.filter((a) => a.status === 'Pending').length;
                const confirmed = data.filter((a) => a.status === 'Confirmed').length;
                const completed = data.filter((a) => a.status === 'Completed').length;
                setStats({
                    totalPatients: data.length,
                    todayAppointments: todayAppts.length,
                    pendingRequests: pending,
                    consultations: completed,
                });
            })
            .catch((err) => console.error('Failed to load appointments:', err));
    }, []);

    // Filter Logic
    const filteredRequests = requests.filter(req => {
        const nameMatch = (req.patientName || req.name).toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === 'All' || (req.status || 'Pending') === statusFilter;
        return nameMatch && statusMatch;
    });

    const handleViewDetails = (request) => {
        // Normalize data before navigation
        const user = {
            id: request.id,
            name: request.patientName || request.name,
            reason: request.consultationType || request.reason,
            requestDate: request.date || request.requestDate,
            requestTime: request.time || request.requestTime,
            status: request.status || 'Pending',
            medicalHistory: request.medicalHistory || 'No history provided',
            reports: request.reports || [],
            ...request
        };
        navigate('/people', { state: { user } });
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="doctor-dashboard-layout">
            {/* --- HEADER --- */}
            <header className="dash-header">
                <div className="header-left">
                    <h1>Good Morning, {doctorName} 👨‍⚕️</h1>
                    <p className="subtitle">Here is what's happening in your clinic today.</p>
                </div>
                <div className="header-right">
                    <button className="icon-btn notification-btn">
                        🔔 <span className="badge">{requests.filter(r => (r.status || 'Pending') === 'Pending').length}</span>
                    </button>
                    <div className="profile-pic">{doctorName.charAt(0)}</div>
                    <button className="icon-btn logout-btn" onClick={handleLogout} title="Log out">
                        🚪
                    </button>
                </div>
            </header>

            {/* --- STATS CARDS --- */}
            <section className="stats-container">
                <div className="stat-card blue">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{stats.totalPatients}</h3>
                        <p>Total Patients</p>
                    </div>
                </div>
                <div className="stat-card teal">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                        <h3>{stats.todayAppointments}</h3>
                        <p>Today's Appointments</p>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <h3>{requests.filter(r => (r.status || 'Pending') === 'Pending').length}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <h3>{stats.consultations}</h3>
                        <p>Consultations</p>
                    </div>
                </div>
            </section>

            <div className="main-grid">
                {/* --- LEFT COLUMN --- */}
                <div className="left-column">

                    {/* TODAY'S SCHEDULE */}
                    <div className="dashboard-card schedule-card">
                        <div className="card-top">
                            <h3>Today's Schedule</h3>
                            <button className="text-btn">View Calendar</button>
                        </div>
                        <div className="schedule-list">
                            {schedule.map(item => (
                                <div key={item.id} className="schedule-item">
                                    <div className="time-col">{item.time}</div>
                                    <div className="info-col">
                                        <h4>{item.name}</h4>
                                        <p>{item.reason}</p>
                                    </div>
                                    <button className="start-btn">Start</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PENDING REQUESTS */}
                    <div className="dashboard-card requests-section-card">
                        <div className="card-top">
                            <h3>Pending Requests</h3>
                            <div className="filters">
                                <input
                                    type="text"
                                    placeholder="Search patient..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="All">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="requests-table-container">
                            <table className="requests-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Date/Time</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.length > 0 ? (
                                        filteredRequests.map(req => (
                                            <tr key={req.id} className="request-row">
                                                <td>
                                                    <div className="pat-cell">
                                                        <div className="pat-avatar">{(req.patientName || req.name).charAt(0)}</div>
                                                        <span>{req.patientName || req.name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="date-time">
                                                        <span>{req.date || req.requestDate}</span>
                                                        <small>{req.time || req.requestTime}</small>
                                                    </div>
                                                </td>
                                                <td>{req.consultationType || req.reason}</td>
                                                <td>
                                                    <span className={`status-pill pill-${(req.status || 'Pending').toLowerCase()}`}>
                                                        {req.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="view-details-btn" onClick={() => handleViewDetails(req)}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-data">No requests found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="right-column">
                    {/* RECENT HISTORY */}
                    <div className="dashboard-card history-card">
                        <h3>Recent History</h3>
                        <div className="history-list">
                            {history.map(item => (
                                <div key={item.id} className="history-item">
                                    <div className="hist-icon">🩺</div>
                                    <div className="hist-info">
                                        <h4>{item.name}</h4>
                                        <p>{item.diagnosis}</p>
                                    </div>
                                    <div className="hist-date">{item.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CALENDAR WIDGET */}
                    <div className="dashboard-card calendar-widget">
                        <h3>Calendar</h3>
                        <div className="mock-calendar">
                            <div className="cal-header">
                                <span>{'<'}</span>
                                <span>October 2023</span>
                                <span>{'>'}</span>
                            </div>
                            <div className="cal-grid">
                                {Array.from({ length: 30 }, (_, i) => (
                                    <div key={i} className={`cal-day ${i === 24 ? 'today' : ''}`}>{i + 1}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
