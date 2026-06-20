import { useState } from 'react';
import '../styles/OwnerRaces.css';

// Initial upcoming races data
const INITIAL_RACES = [
  {
    id: 'pegasus',
    grade: 'G1 STAKES',
    title: 'The Pegasus World Cup',
    location: 'Gulfstream Park, FL',
    date: 'Oct 12, 2024',
    prizePool: '$3,000,000',
    status: 'Open', // 'Open' | 'Registered' | 'Closed'
    registeredHorse: null,
  },
  {
    id: 'royal-ascot',
    grade: 'G2 HANDICAP',
    title: 'Royal Ascot Gold Cup',
    location: 'Ascot, Berkshire, UK',
    date: 'Jun 20, 2024',
    prizePool: '£500,000',
    status: 'Registered',
    registeredHorse: 'Silver Mist',
  },
  {
    id: 'kentucky-derby',
    grade: 'G1 STAKES',
    title: 'Kentucky Derby',
    location: 'Churchill Downs, KY',
    date: 'May 4, 2024',
    prizePool: '$5,000,000',
    status: 'Closed',
    registeredHorse: null,
  },
];

export default function OwnerRaces({ onNavigate, horses = [] }) {
  const [races, setRaces] = useState(INITIAL_RACES);
  const [expandedRaceId, setExpandedRaceId] = useState(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [activeRace, setActiveRace] = useState(null);
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [toasts, setToasts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Mock stable horses if none passed (fallback)
  const stableHorses = horses.length > 0 ? horses : [
    { id: 1, name: 'Thunder Dash', status: 'Active', breed: 'THOROUGHBRED' },
    { id: 2, name: 'Silver Mist', status: 'Training', breed: 'ARABIAN' },
    { id: 3, name: 'Midnight Ace', status: 'Resting', breed: 'QUARTER HORSE' },
  ];

  // Filter horses that are eligible to register (Active or Training status)
  const eligibleHorses = stableHorses.filter(
    (h) => h.status === 'Active' || h.status === 'Training'
  );

  // Toggle card details drawer
  const toggleExpandRace = (raceId) => {
    setExpandedRaceId((prev) => (prev === raceId ? null : raceId));
  };

  // Trigger registration flow
  const handleRegisterClick = (race) => {
    setActiveRace(race);
    setSelectedHorseId('');
    setShowRegModal(true);
  };

  // Complete registration
  const submitRegistration = (e) => {
    e.preventDefault();
    if (!selectedHorseId) return;

    const horse = stableHorses.find((h) => h.id.toString() === selectedHorseId.toString());
    if (!horse) return;

    // Update race state
    setRaces((prev) =>
      prev.map((r) =>
        r.id === activeRace.id
          ? { ...r, status: 'Registered', registeredHorse: horse.name }
          : r
      )
    );

    // Show success toast
    const newToast = {
      id: Date.now(),
      message: `Successfully registered ${horse.name} in ${activeRace.title}!`,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);

    // Close modal
    setShowRegModal(false);
    setActiveRace(null);
  };

  // Handle mock PDF downloads
  const triggerDownload = (fileName) => {
    const newToast = {
      id: Date.now(),
      message: `Downloading ${fileName}...`,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3000);
  };

  // Nav items definition
  const navItems = [
    { key: 'race', label: 'Race', icon: 'bi-flag-fill', onClick: (e) => { e.preventDefault(); } },
    { key: 'registration', label: 'Registration', icon: 'bi-clipboard-check', onClick: (e) => { e.preventDefault(); } },
    { key: 'horse', label: 'Horse', icon: 'bi-award', onClick: (e) => { e.preventDefault(); if (onNavigate) onNavigate('stable-management'); } },
    { key: 'alerts', label: 'Alerts', icon: 'bi-bell', onClick: (e) => { e.preventDefault(); } },
    { key: 'profile', label: 'Profile', icon: 'bi-person-circle', onClick: (e) => { e.preventDefault(); } },
  ];

  const [activeNav, setActiveNav] = useState('race');

  return (
    <div className="races-page-wrapper">

      {/* ── Mobile Top Header (visible only on mobile) ── */}
      <header className="races-mobile-header">
        <button
          className="btn border-0 p-1 text-dark-navy"
          aria-label="Open Menu"
          onClick={() => setMenuOpen(true)}
        >
          <i className="bi bi-list fs-3"></i>
        </button>
        <span className="brand-logo fw-bold" style={{ color: 'var(--primary-blue)', letterSpacing: '-0.5px', fontSize: '18px' }}>
          HRTMS
        </span>
        <div
          className="rounded-3"
          style={{ width: '36px', height: '36px', backgroundColor: '#dbeafe', border: '1px solid #cbd5e1' }}
        ></div>
      </header>

      {/* ── Layout wrapper: sidebar + main ── */}
      <div className="races-layout">

        {/* ── Left Vertical Sidebar (desktop always visible, mobile as drawer) ── */}
        {menuOpen && (
          <div className="drawer-overlay" onClick={() => setMenuOpen(false)}></div>
        )}
        <aside className={`races-sidebar ${menuOpen ? 'open' : ''}`}>
          {/* Sidebar Header */}
          <div className="races-sidebar-header">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-2" style={{ width: '32px', height: '32px', backgroundColor: '#e2e8f0', minWidth: '32px' }}></div>
              <div>
                <span className="fw-bold text-dark-navy d-block" style={{ fontSize: '15px', letterSpacing: '-0.3px' }}>HRTMS</span>
                <span style={{ fontSize: '11px', color: 'var(--secondary-custom)' }}>Owner Portal</span>
              </div>
            </div>
            {/* Close button - mobile only */}
            <button
              className="btn border-0 p-1 races-sidebar-close"
              aria-label="Close sidebar"
              onClick={() => setMenuOpen(false)}
            >
              <i className="bi bi-x-lg text-secondary-custom"></i>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="races-sidebar-nav">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={`#${item.key}`}
                className={`races-sidebar-link ${activeNav === item.key ? 'active' : ''}`}
                onClick={(e) => {
                  item.onClick(e);
                  setActiveNav(item.key);
                  setMenuOpen(false);
                }}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Sidebar Footer: User Profile */}
          <div className="races-sidebar-footer">
            <div
              className="rounded-3"
              style={{ width: '36px', height: '36px', minWidth: '36px', backgroundColor: '#dbeafe', border: '1px solid #cbd5e1' }}
            ></div>
            <div>
              <span className="fw-semibold text-dark-navy d-block" style={{ fontSize: '13px' }}>Horse Owner</span>
              <span style={{ fontSize: '11px', color: 'var(--secondary-custom)' }}>owner@hrtms.com</span>
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="races-main pb-5">
          <div className="races-content-container px-3 px-md-4">
        {/* Centered Title & Description */}
        <div className="events-intro-section mb-4">
          <h1 className="events-title mb-2">Events</h1>
          <p className="events-subtitle">
            Manage your stable's calendar and access critical regulations.
          </p>
        </div>

        {/* Rulebooks Section */}
        <div className="rulebooks-section mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="rulebook-section-header m-0">Rulebooks</h2>
            <a href="#view-all" className="view-all-link" onClick={(e) => e.preventDefault()}>
              VIEW ALL
            </a>
          </div>

          <div className="row g-4">
            {/* Rule 1: Tournament Regulations */}
            <div className="col-12 col-md-4">
              <div className="rulebook-card">
                <div className="rulebook-icon-wrapper blue-box">
                  <i className="bi bi-file-earmark-text-fill fs-4"></i>
                </div>
                <h3 className="rulebook-card-title">Tournament Regulations</h3>
                <p className="rulebook-card-desc">
                  Complete guide to entry requirements, scoring, and registration rules.
                </p>
                <a
                  href="#download"
                  className="rulebook-download-link"
                  onClick={(e) => { e.preventDefault(); triggerDownload('Tournament_Regulations.pdf'); }}
                >
                  <i className="bi bi-download"></i> PDF · 2.4 MB
                </a>
              </div>
            </div>

            {/* Rule 2: Safety Standards */}
            <div className="col-12 col-md-4">
              <div className="rulebook-card">
                <div className="rulebook-icon-wrapper red-box">
                  <i className="bi bi-shield-fill-check fs-4"></i>
                </div>
                <h3 className="rulebook-card-title">Safety Standards</h3>
                <p className="rulebook-card-desc">
                  Mandatory health checks, equipment protocols, and track safety policies.
                </p>
                <a
                  href="#download"
                  className="rulebook-download-link"
                  onClick={(e) => { e.preventDefault(); triggerDownload('Safety_Standards.pdf'); }}
                >
                  <i className="bi bi-download"></i> PDF · 1.8 MB
                </a>
              </div>
            </div>

            {/* Rule 3: Anti-Doping Policy */}
            <div className="col-12 col-md-4">
              <div className="rulebook-card">
                <div className="rulebook-icon-wrapper gold-box">
                  <i className="bi bi-scales fs-4"></i>
                </div>
                <h3 className="rulebook-card-title">Anti-Doping Policy</h3>
                <p className="rulebook-card-desc">
                  Updated list of prohibited substances and testing procedures.
                </p>
                <a
                  href="#download"
                  className="rulebook-download-link"
                  onClick={(e) => { e.preventDefault(); triggerDownload('Anti_Doping_Policy.pdf'); }}
                >
                  <i className="bi bi-download"></i> PDF · 3.1 MB
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Races Section */}
        <div className="upcoming-races-section">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="races-list-header m-0">Upcoming Races</h2>
            <button className="btn btn-filter-funnel d-flex align-items-center gap-2">
              <i className="bi bi-sliders"></i>
            </button>
          </div>

          <div className="d-flex flex-column gap-4">
            {races.map((race) => {
              const isExpanded = expandedRaceId === race.id;
              return (
                <div key={race.id} className="race-event-card">
                  <div className="p-4">
                    <div className="races-row-layout d-flex justify-content-between align-items-center">

                      {/* Left: Grade, Name & Location */}
                      <div className="d-flex flex-column gap-2" style={{ flex: '1 1 auto', minWidth: '250px' }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge-grade">{race.grade}</span>
                          <span className={`badge-entry-status ${race.status.toLowerCase()}`}>
                            {race.status === 'Open' ? 'Entry Open' : race.status}
                          </span>
                        </div>
                        <h3 className="race-event-name m-0">{race.title}</h3>
                        <span className="race-event-location">
                          <i className="bi bi-geo-alt-fill me-1"></i> {race.location}
                        </span>
                      </div>

                      {/* Middle: Date & Prize Pool */}
                      <div className="d-flex gap-5 px-md-4 text-md-end" style={{ flex: '0 0 auto' }}>
                        <div className="d-flex flex-column align-items-md-end">
                          <span className="race-info-label">Date</span>
                          <span className="race-info-value">{race.date}</span>
                        </div>
                        <div className="d-flex flex-column align-items-md-end">
                          <span className="race-info-label">Prize Pool</span>
                          <span className="race-info-value prize-gold">{race.prizePool}</span>
                        </div>
                      </div>

                      {/* Right: Action Button and Accordion Toggle */}
                      <div className="d-flex align-items-center justify-content-end" style={{ flex: '0 0 auto', minWidth: '180px' }}>
                        <div className="register-btn-group">
                          {race.status === 'Open' && (
                            <button
                              className="btn btn-register-action"
                              onClick={() => handleRegisterClick(race)}
                            >
                              REGISTER
                            </button>
                          )}
                          {race.status === 'Registered' && (
                            <button className="btn btn-register-action registered-done border">
                              <i className="bi bi-check-circle-fill text-success me-1"></i> REGISTERED
                            </button>
                          )}
                          {race.status === 'Closed' && (
                            <button className="btn btn-register-action closed-done border">
                              ENTRY CLOSED
                            </button>
                          )}
                          <button
                            className="btn-chevron-toggle"
                            onClick={() => toggleExpandRace(race.id)}
                            aria-label="Toggle details"
                          >
                            <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Expanded Race Details (Accordion Drawer) */}
                  {isExpanded && (
                    <div className="expanded-race-details border-top">
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <h4 className="h6 fw-bold text-dark-navy mb-2">Race Requirements</h4>
                          <ul className="text-secondary-custom p-0 ps-3 mb-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                            <li>Must hold a Thoroughbred / Arabian certified passport.</li>
                            <li>Minimum jockey license grade: A Class.</li>
                            <li>Post weight limits: 450kg - 600kg.</li>
                          </ul>
                        </div>
                        <div className="col-12 col-md-6">
                          <h4 className="h6 fw-bold text-dark-navy mb-2">Entry Details</h4>
                          {race.status === 'Registered' ? (
                            <div className="bg-white border p-3 rounded-3" style={{ fontSize: '13px' }}>
                              <span className="text-secondary-custom d-block mb-1">Registered Entry:</span>
                              <strong className="text-dark-navy d-flex align-items-center gap-1">
                                <i className="bi bi-award-fill text-warning"></i> {race.registeredHorse}
                              </strong>
                            </div>
                          ) : (
                            <p className="text-secondary-custom mb-0" style={{ fontSize: '13px' }}>
                              No horse currently registered for this event.
                              {race.status === 'Open' && ' Click "REGISTER" above to enter one of your equine athletes.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
          </div>

      {/* Horse Selection Modal */}
      {showRegModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowRegModal(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark-navy m-0">Register Horse</h5>
              <button className="btn-close shadow-none border-0" onClick={() => setShowRegModal(false)}></button>
            </div>

            <form onSubmit={submitRegistration}>
              <div className="modal-body-custom d-flex flex-column gap-3">
                <span className="text-secondary-custom d-block mb-2" style={{ fontSize: '14px' }}>
                  Select an eligible horse from your stable to register for <strong>{activeRace?.title}</strong>:
                </span>

                {eligibleHorses.length > 0 ? (
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {eligibleHorses.map((horse) => {
                      const isSelected = selectedHorseId.toString() === horse.id.toString();
                      return (
                        <div
                          key={horse.id}
                          className={`horse-select-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedHorseId(horse.id)}
                        >
                          <div>
                            <strong className="text-dark-navy d-block" style={{ fontSize: '15px' }}>{horse.name}</strong>
                            <span className="text-secondary-custom" style={{ fontSize: '12px' }}>{horse.breed} · {horse.status}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            {isSelected ? (
                              <i className="bi bi-check-circle-fill text-primary fs-5"></i>
                            ) : (
                              <i className="bi bi-circle text-muted fs-5"></i>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-light border rounded-3">
                    <i className="bi bi-exclamation-circle text-warning fs-3 mb-2 d-block"></i>
                    <p className="text-secondary-custom mb-0" style={{ fontSize: '13px' }}>
                      No active stable horses found. Go to 'Horse' page to add or activate one.
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-footer-custom d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2"
                  style={{ borderRadius: '10px', fontSize: '14px', fontWeight: '600' }}
                  onClick={() => setShowRegModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2"
                  style={{
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: 'var(--primary-blue)',
                    borderColor: 'var(--primary-blue)'
                  }}
                  disabled={!selectedHorseId}
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast Alerts Container */}
      <div className="toast-container-custom">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-item-custom">
            <i className="bi bi-check-circle-fill text-success fs-5"></i>
            <span className="text-dark-navy fw-semibold" style={{ fontSize: '13px' }}>{toast.message}</span>
          </div>
        ))}
      </div>
        </main>
      </div>
    </div>
  );
}
