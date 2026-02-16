function StatsCards({ total, pending, confirmed, completed }) {
  return (
    <section className="dash-stats">
      <div className="dash-stat-card">
        <div className="dash-stat-icon blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <p className="dash-stat-value">{total}</p>
          <p className="dash-stat-label">Total Appointments</p>
        </div>
      </div>
      <div className="dash-stat-card">
        <div className="dash-stat-icon amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div>
          <p className="dash-stat-value">{pending}</p>
          <p className="dash-stat-label">Pending</p>
        </div>
      </div>
      <div className="dash-stat-card">
        <div className="dash-stat-icon green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
          <p className="dash-stat-value">{confirmed}</p>
          <p className="dash-stat-label">Confirmed</p>
        </div>
      </div>
      <div className="dash-stat-card">
        <div className="dash-stat-icon purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div>
          <p className="dash-stat-value">{completed}</p>
          <p className="dash-stat-label">Completed</p>
        </div>
      </div>
    </section>
  );
}

export default StatsCards;
