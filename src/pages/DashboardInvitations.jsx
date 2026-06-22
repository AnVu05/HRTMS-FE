import React from 'react';
import '../styles/DashboardInvitations.css';

const INVITATIONS = [
  {
    id: 1,
    title: 'The Midnight Sprint',
    subtitle: 'Dubai Cup 2024',
    date: 'Oct 28, 14:30 GMT',
    track: 'Sector 4 - Grand Track',
  },
  {
    id: 2,
    title: 'Dawn Patrol Qualifier',
    subtitle: 'Regional Eliminators',
    date: 'Nov 02, 06:00 GMT',
    track: 'Sector 1 - Alpha',
  },
];

const SCHEDULED = [
  { id: 'eq', title: 'Equinox Derby', date: 'Oct 25, 18:00 GMT' },
  { id: 'dr', title: 'Desert Rose Stakes', date: 'Oct 26, 09:30 GMT' },
];

export default function DashboardInvitations({ onNavigate }) {
  return (
    <div className="dashboard-invitations-wrapper container-fluid py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-light mb-0">Pending Invitations</h2>
          <div></div>
        </div>

        {INVITATIONS.map((inv) => (
          <div key={inv.id} className="inv-card mb-4">
            <div className="inv-card-inner p-3 d-flex flex-column flex-md-row justify-content-between gap-3">
              <div>
                <h4 className="inv-title mb-1">{inv.title}</h4>
                <div className="text-muted small mb-2">{inv.subtitle}</div>

                <div className="d-flex flex-wrap gap-3 small text-muted">
                  <div className="d-flex align-items-center gap-2"><i className="bi bi-calendar3"></i>{inv.date}</div>
                  <div className="d-flex align-items-center gap-2"><i className="bi bi-geo-alt-fill"></i>{inv.track}</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                <button className="btn btn-accept px-4 py-2">Accept</button>
                <button className="btn btn-decline px-4 py-2">Decline</button>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h3 className="text-light mb-0">My Scheduled Races</h3>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-success small">View Calendar</a>
          </div>

          <div className="scheduled-list">
            {SCHEDULED.map(s => (
              <div key={s.id} className="scheduled-item d-flex justify-content-between align-items-center p-3 mb-2">
                <div>
                  <div className="fw-bold text-light">{s.title}</div>
                  <div className="small text-muted">{s.date}</div>
                </div>
                <div className="chev">&rsaquo;</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
