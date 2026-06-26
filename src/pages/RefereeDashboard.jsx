import { useState, useEffect, useCallback } from 'react';
import '../styles/RefereeDashboard.css';
import { refereeService } from '../services/referee.service';


function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function RefereeDashboard({ onNavigate, refereeId = 8 }) {
  const [invitations, setInvitations] = useState([]);
  const [scheduledRaces, setScheduledRaces] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [submitting, setSubmitting] = useState(null); // raceId being acted on
  const [declineOpenId, setDeclineOpenId] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  const fetchInvitations = useCallback(async () => {
    setLoadingInvitations(true);
    try {
      const res = await refereeService.getPendingInvitations(refereeId);
      console.log('Referee invitations API response:', res);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setInvitations(data);
      } else {
        setInvitations([]);
      }
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
      setInvitations([]);
    } finally {
      setLoadingInvitations(false);
    }
  }, [refereeId]);

  const fetchScheduledRaces = useCallback(async () => {
    setLoadingScheduled(true);
    try {
      const res = await refereeService.getScheduledRaces(refereeId);
      console.log('Referee scheduled races API response:', res);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setScheduledRaces(data);
      } else {
        setScheduledRaces([]);
      }
    } catch (err) {
      console.error('Failed to fetch scheduled races:', err);
      setScheduledRaces([]);
    } finally {
      setLoadingScheduled(false);
    }
  }, [refereeId]);

  useEffect(() => {
    fetchInvitations();
    fetchScheduledRaces();
  }, [fetchInvitations, fetchScheduledRaces]);

  const handleAccept = async (inv) => {
    const raceId = inv.raceId || inv.race_id || inv.id;
    const notificationId = inv.notificationId;
    if (!window.confirm('Are you sure you want to accept this invitation?')) return;
    setSubmitting(raceId);
    try {
      await refereeService.acceptInvitation(refereeId, notificationId);
      alert('Invitation accepted successfully!');
      // Move from invitations to scheduled
      setInvitations(prev => prev.filter(i => (i.raceId || i.race_id || i.id) !== raceId));
      setScheduledRaces(prev => [...prev, { ...inv, status: 'SCHEDULED' }]);
    } catch (err) {
      console.error('Failed to accept invitation:', err);
      alert(err.message || 'Failed to accept invitation');
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeclineToggle = (raceId) => {
    if (declineOpenId === raceId) {
      setDeclineOpenId(null);
      setDeclineReason('');
    } else {
      setDeclineOpenId(raceId);
      setDeclineReason('');
    }
  };

  const handleConfirmDecline = async (inv) => {
    const raceId = inv.raceId || inv.race_id || inv.id;
    const notificationId = inv.notificationId;
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining.');
      return;
    }
    setSubmitting(raceId);
    try {
      await refereeService.declineInvitation(refereeId, notificationId, declineReason);
      alert('Invitation declined successfully.');
      setInvitations(prev => prev.filter(i => (i.raceId || i.race_id || i.id) !== raceId));
      setDeclineOpenId(null);
      setDeclineReason('');
    } catch (err) {
      console.error('Failed to decline invitation:', err);
      alert(err.message || 'Failed to decline invitation');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="referee-page">

      {/* ── Top Navbar ── */}
      <nav className="referee-navbar">
        <span className="brand">HRTMS</span>
        <div className="nav-actions">
          <button
            className="sign-out-btn"
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out?')) {
                onNavigate('login');
              }
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            Sign Out
          </button>
          <div className="avatar-circle">
            <i className="bi bi-person-fill"></i>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="referee-content">

        {/* ═══ Pending Invitations Section ═══ */}
        <div className="referee-section-header">
          <h2>Pending Invitations</h2>
        </div>

        {loadingInvitations ? (
          <div className="referee-loading">
            <div className="spinner"></div>
          </div>
        ) : invitations.length === 0 ? (
          <div className="referee-empty-state">
            <i className="bi bi-envelope-check"></i>
            <h5>No Pending Invitations</h5>
            <p>You're all caught up! Check back later for new race assignments.</p>
          </div>
        ) : (
          invitations.map((inv, index) => {
            const raceId = inv.raceId || inv.race_id || inv.id;
            const isDeclineOpen = declineOpenId === raceId;
            const isSubmitting = submitting === raceId;

            return (
              <div
                key={raceId}
                className="invitation-card"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Top Row: Race Name + Badge */}
                <div className="card-top">
                  <div>
                    <h3 className="race-name">{inv.tournamentName || inv.tournament_name || 'Untitled Tournament'}</h3>
                    <div className="tournament-name" style={{ color: '#f0883e', fontWeight: 600 }}>{inv.raceName || inv.race_name || inv.name || 'Untitled Race'}</div>
                  </div>
                  <span className="action-badge">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    Action Required
                  </span>
                </div>

                {/* Meta Info */}
                <div className="invitation-meta">
                  <div className="meta-group">
                    <span className="meta-label">Date & Time</span>
                    <span className="meta-value">
                      <i className="bi bi-calendar-event"></i>
                      {formatDate(inv.date)}, {formatTime(inv.startTime || inv.time || inv.start_time || '')} GMT
                    </span>
                  </div>
                  <div className="meta-group">
                    <span className="meta-label">Track</span>
                    <span className="meta-value">
                      <i className="bi bi-geo-alt-fill"></i>
                      {inv.track || inv.venue || 'TBD'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="invitation-actions">
                  <button
                    className="btn-accept"
                    onClick={() => handleAccept(inv)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Accept'}
                  </button>

                  {!isDeclineOpen ? (
                    <button
                      className="btn-decline"
                      onClick={() => handleDeclineToggle(raceId)}
                      disabled={isSubmitting}
                    >
                      Decline
                    </button>
                  ) : (
                    <div className="decline-reason-area" style={{ flex: 1 }}>
                      <textarea
                        placeholder="Reason for rejection..."
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        rows={2}
                      />
                      <button
                        className="btn-confirm-decline"
                        onClick={() => handleConfirmDecline(inv)}
                        disabled={isSubmitting || !declineReason.trim()}
                      >
                        {isSubmitting ? 'Processing...' : 'Confirm Decline'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* ── Divider ── */}
        <hr className="referee-section-divider" />

        {/* ═══ My Scheduled Races Section ═══ */}
        <div className="referee-section-header">
          <h2>My Scheduled Races</h2>
          <span className="view-link">View Calendar</span>
        </div>

        {loadingScheduled ? (
          <div className="referee-loading">
            <div className="spinner"></div>
          </div>
        ) : scheduledRaces.length === 0 ? (
          <div className="referee-empty-state">
            <i className="bi bi-calendar-x"></i>
            <h5>No Scheduled Races</h5>
            <p>Accept an invitation to see your upcoming races here.</p>
          </div>
        ) : (
          scheduledRaces.map((race, index) => {
            const raceId = race.id;
            const statusColor = {
              'SCHEDULED': { bg: 'rgba(88,166,255,0.12)', color: '#58a6ff', border: 'rgba(88,166,255,0.25)' },
              'PUBLISHED': { bg: 'rgba(88,166,255,0.12)', color: '#58a6ff', border: 'rgba(88,166,255,0.25)' },
              'IN_PROGRESS': { bg: 'rgba(63,185,80,0.12)', color: '#3fb950', border: 'rgba(63,185,80,0.25)' },
              'COMPLETED': { bg: 'rgba(139,148,158,0.12)', color: '#8b949e', border: 'rgba(139,148,158,0.25)' },
              'CANCELLED': { bg: 'rgba(248,81,73,0.12)', color: '#f85149', border: 'rgba(248,81,73,0.25)' },
            }[race.status] || { bg: 'rgba(139,148,158,0.12)', color: '#8b949e', border: 'rgba(139,148,158,0.25)' };

            return (
              <div
                key={raceId}
                className="scheduled-race-card"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="race-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0 }}>{race.tournamentName || race.tournament_name || 'Untitled Tournament'}</h4>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                      borderRadius: '5px', letterSpacing: '0.5px',
                      backgroundColor: statusColor.bg, color: statusColor.color,
                      border: `1px solid ${statusColor.border}`,
                    }}>
                      {race.status || 'UNKNOWN'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#f0883e', fontWeight: 600, marginBottom: '8px' }}>
                    {race.name || race.raceName || race.race_name || 'Untitled Race'}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div className="race-date">
                      <i className="bi bi-calendar3"></i>
                      {formatDate(race.date)}
                    </div>
                    <div className="race-date">
                      <i className="bi bi-clock"></i>
                      {formatTime(race.startTime || '')} – {formatTime(race.endTime || '')}
                    </div>
                    {race.track && (
                      <div className="race-date">
                        <i className="bi bi-geo-alt-fill"></i>
                        {race.track}
                      </div>
                    )}
                    {race.laps != null && (
                      <div className="race-date">
                        <i className="bi bi-arrow-repeat"></i>
                        {race.laps} laps
                      </div>
                    )}
                    {race.numHorse != null && (
                      <div className="race-date">
                        <i className="bi bi-trophy"></i>
                        {race.numHorse} horses
                      </div>
                    )}
                  </div>
                </div>
                <div className="arrow-icon">
                  <i className="bi bi-chevron-right"></i>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
