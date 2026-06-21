import { useState } from 'react';
import '../styles/JockeyProfile.css';

// ─── Mock Data ───
const INITIAL_PROFILE = {
  name: 'Marcus Sterling',
  yearsExp: 8,
  age: 28,
  bio: 'Specializing in high-stakes sprint races. Known for strategic positioning and maintaining composure in tight fields. Consistently ranking in the top 10% for the past three seasons.',
};

const INITIAL_CERTIFICATES = [
  {
    id: 1,
    name: 'Jockey License A',
    status: 'verified',
    image: null,
  },
  {
    id: 2,
    name: 'Safety Certification',
    status: 'pending',
    image: null,
  },
];

const INITIAL_INVITATIONS = [
  {
    id: 1,
    orgName: 'Crestwood Syndicate',
    orgDesc: 'Elite Class Racing',
    avatarType: 'blue',
    avatarIcon: 'bi-trophy-fill',
  },
  {
    id: 2,
    orgName: 'Apex Equine Group',
    orgDesc: 'Regional Circuit',
    avatarType: 'purple',
    avatarText: 'AE',
  },
];

const INITIAL_UPDATES = [
  {
    id: 1,
    icon: 'success',
    iconClass: 'bi-check-circle-fill',
    title: 'Certificate Verified',
    desc: 'Professional Jockey License A has been successfully validated.',
    time: '2 hours ago',
  },
];

const SEASON_STATS = {
  racesEntered: 24,
  topPlaced: 8,
};

export default function JockeyProfile({ onNavigate }) {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [certificates, setCertificates] = useState(INITIAL_CERTIFICATES);
  const [invitations, setInvitations] = useState(INITIAL_INVITATIONS);
  const [updates, setUpdates] = useState(INITIAL_UPDATES);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [editingField, setEditingField] = useState(null);

  // Show a toast notification
  const showToast = (message) => {
    const toast = { id: Date.now(), message };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 3500);
  };

  // Handle profile field change
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Save profile
  const handleSaveProfile = () => {
    showToast('Profile changes saved successfully!');
  };

  // Accept / Decline invitation
  const handleInvitation = (invId, action) => {
    const inv = invitations.find((i) => i.id === invId);
    setInvitations((prev) => prev.filter((i) => i.id !== invId));
    if (action === 'accept') {
      showToast(`Accepted invitation from ${inv?.orgName}`);
      setUpdates((prev) => [
        {
          id: Date.now(),
          icon: 'info',
          iconClass: 'bi-person-plus-fill',
          title: 'Invitation Accepted',
          desc: `You joined ${inv?.orgName}.`,
          time: 'Just now',
        },
        ...prev,
      ]);
    } else {
      showToast(`Declined invitation from ${inv?.orgName}`);
    }
  };

  // Add certificate
  const handleAddCertificate = (e) => {
    e.preventDefault();
    if (!newCertName.trim()) return;
    const cert = {
      id: Date.now(),
      name: newCertName.trim(),
      status: 'pending',
      image: null,
    };
    setCertificates((prev) => [...prev, cert]);
    setShowCertModal(false);
    setNewCertName('');
    showToast(`Certificate "${cert.name}" uploaded for review.`);
    setUpdates((prev) => [
      {
        id: Date.now(),
        icon: 'warning',
        iconClass: 'bi-hourglass-split',
        title: 'Certificate Pending',
        desc: `${cert.name} is awaiting verification.`,
        time: 'Just now',
      },
      ...prev,
    ]);
  };

  // Request global verification
  const handleRequestVerification = () => {
    showToast('Global verification request submitted!');
    setUpdates((prev) => [
      {
        id: Date.now(),
        icon: 'info',
        iconClass: 'bi-shield-check',
        title: 'Verification Requested',
        desc: 'Your global verification request is being reviewed.',
        time: 'Just now',
      },
      ...prev,
    ]);
  };

  return (
    <div className="jockey-profile-wrapper pb-5">
      {/* Header Navigation Bar */}
      <nav className="main-navbar d-flex justify-content-between align-items-center mb-0 py-2 px-3">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn border-0 p-0 text-dark-navy menu-toggle-btn"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className="bi bi-list fs-3"></i>
          </button>
          <span
            className="brand-logo fs-4 fw-bold d-flex align-items-center gap-2"
            style={{ color: 'var(--dark-navy)', letterSpacing: '-0.5px' }}
          >
            HRTMS
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav d-flex align-items-center gap-2">
          <a
            href="#race"
            onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('owner-races'); }}
            className="nav-item-custom"
          >
            <i className="bi bi-flag-fill"></i>
            <span>Races</span>
          </a>
          <a
            href="#profile"
            onClick={(e) => e.preventDefault()}
            className="nav-item-custom active"
          >
            <i className="bi bi-person-circle"></i>
            <span>Profile</span>
          </a>
          <a
            href="#alerts"
            onClick={(e) => e.preventDefault()}
            className="nav-item-custom"
          >
            <i className="bi bi-bell"></i>
            <span>Alerts</span>
          </a>
        </div>

        {/* Mobile Drawer */}
        {menuOpen && <div className="drawer-overlay" onClick={() => setMenuOpen(false)}></div>}
        <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
          <div className="drawer-header d-flex justify-content-between align-items-center">
            <span
              className="brand-logo fs-4 fw-bold d-flex align-items-center gap-2"
              style={{ color: 'var(--dark-navy)', letterSpacing: '-0.5px' }}
            >
              HRTMS
            </span>
            <button className="btn-close shadow-none border-0" onClick={() => setMenuOpen(false)} aria-label="Close"></button>
          </div>
          <div className="drawer-body">
            <a href="#race" onClick={(e) => { e.preventDefault(); setMenuOpen(false); if (onNavigate) onNavigate('owner-races'); }} className="drawer-link">
              <i className="bi bi-flag-fill"></i>
              <span>Races</span>
            </a>
            <a href="#profile" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }} className="drawer-link active">
              <i className="bi bi-person-circle"></i>
              <span>Profile</span>
            </a>
            <a href="#alerts" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }} className="drawer-link">
              <i className="bi bi-bell"></i>
              <span>Alerts</span>
            </a>
          </div>
        </div>

        {/* Sign Out */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn border-0 d-flex align-items-center gap-2"
            style={{ color: '#ef4444', fontWeight: 700, fontSize: 14 }}
            onClick={() => { if (onNavigate) onNavigate('login'); }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span className="d-none d-sm-inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="jockey-profile-content">
        <div className="jockey-profile-grid">
          {/* ─── Left Column ─── */}
          <div className="d-flex flex-column gap-4">
            {/* Personal Profile Card */}
            <div className="jp-card" id="personal-profile-card">
              <h2 className="jp-section-title">
                <i className="bi bi-person-vcard"></i>
                Personal Profile
              </h2>

              <div className="jp-input-row mb-3">
                <div>
                  <label className="jp-label">Jockey Name</label>
                  <input
                    type="text"
                    className="jp-input"
                    id="jockey-name-input"
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="jp-label">Years Exp</label>
                  <input
                    type="number"
                    className="jp-input"
                    id="jockey-exp-input"
                    value={profile.yearsExp}
                    onChange={(e) => handleProfileChange('yearsExp', e.target.value)}
                  />
                </div>
                <div>
                  <label className="jp-label">Age</label>
                  <input
                    type="number"
                    className="jp-input"
                    id="jockey-age-input"
                    value={profile.age}
                    onChange={(e) => handleProfileChange('age', e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="jp-label">Professional Bio</label>
                <textarea
                  className="jp-input jp-textarea"
                  id="jockey-bio-input"
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end">
                <button
                  className="jp-save-btn"
                  id="save-profile-btn"
                  onClick={handleSaveProfile}
                >
                  <i className="bi bi-floppy"></i>
                  Save Changes
                </button>
              </div>
            </div>

            {/* Professional Certificates Card */}
            <div className="jp-card" id="certificates-card">
              <h2 className="jp-section-title">
                <i className="bi bi-patch-check-fill"></i>
                Professional Certificates
              </h2>

              <div className="jp-cert-grid">
                {certificates.map((cert) => (
                  <div className="jp-cert-item" key={cert.id} id={`cert-${cert.id}`}>
                    {/* Certificate placeholder image */}
                    <div className="jp-cert-image d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f1f5f9' }}>
                      <div style={{ textAlign: 'center', padding: '12px' }}>
                        <i className="bi bi-file-earmark-richtext" style={{ fontSize: '32px', color: '#94a3b8' }}></i>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certificate</div>
                      </div>
                    </div>
                    <div className="jp-cert-info">
                      <span className="jp-cert-name">{cert.name}</span>
                      <span className={`jp-cert-badge ${cert.status}`}>
                        {cert.status === 'verified' && <><i className="bi bi-check-circle-fill me-1"></i>Verified</>}
                        {cert.status === 'pending' && <><i className="bi bi-clock-fill me-1"></i>Pending</>}
                        {cert.status === 'expired' && <><i className="bi bi-x-circle-fill me-1"></i>Expired</>}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add new cert placeholder */}
                <div
                  className="jp-cert-add"
                  id="add-certificate-btn"
                  onClick={() => setShowCertModal(true)}
                >
                  <div className="jp-cert-add-icon">
                    <i className="bi bi-plus-lg"></i>
                  </div>
                  <span className="jp-cert-add-title">Add New Certificate</span>
                  <span className="jp-cert-add-desc">Upload verified racing credentials</span>
                </div>
              </div>

              <div className="text-center mt-2">
                <button
                  className="jp-verify-btn"
                  id="request-verification-btn"
                  onClick={handleRequestVerification}
                >
                  <i className="bi bi-shield-check"></i>
                  Request Global Verification
                </button>
              </div>
            </div>
          </div>

          {/* ─── Right Sidebar ─── */}
          <div className="jp-sidebar">
            {/* Season Summary */}
            <div className="jp-card jp-summary-card" id="season-summary-card" style={{ position: 'relative' }}>
              <span className="jp-summary-icon">
                <i className="bi bi-bar-chart-line-fill"></i>
              </span>
              <h3 className="jp-summary-title">Season Summary</h3>
              <div className="jp-summary-stats">
                <div className="jp-stat-box">
                  <div className="jp-stat-value">{SEASON_STATS.racesEntered}</div>
                  <div className="jp-stat-label">Races Entered</div>
                </div>
                <div className="jp-stat-box">
                  <div className="jp-stat-value">{SEASON_STATS.topPlaced}</div>
                  <div className="jp-stat-label">Top 3 Placed</div>
                </div>
              </div>
            </div>

            {/* Invitations */}
            {invitations.length > 0 && (
              <div className="jp-card" id="invitations-card">
                <div className="jp-invite-header">
                  <span className="jp-invite-title">
                    <i className="bi bi-envelope-open-fill" style={{ color: 'var(--primary-blue)' }}></i>
                    Invitations
                  </span>
                  <span className="jp-invite-badge">{invitations.length} NEW</span>
                </div>

                <div className="jp-invite-list">
                  {invitations.map((inv) => (
                    <div className="jp-invite-item" key={inv.id} id={`invite-${inv.id}`}>
                      <div className={`jp-invite-avatar ${inv.avatarType}`}>
                        {inv.avatarIcon ? (
                          <i className={`bi ${inv.avatarIcon}`}></i>
                        ) : (
                          inv.avatarText
                        )}
                      </div>
                      <div className="jp-invite-details">
                        <div className="jp-invite-name">{inv.orgName}</div>
                        <div className="jp-invite-desc">{inv.orgDesc}</div>
                        <div className="jp-invite-actions">
                          <button
                            className="jp-invite-accept"
                            onClick={() => handleInvitation(inv.id, 'accept')}
                          >
                            Accept
                          </button>
                          <button
                            className="jp-invite-decline"
                            onClick={() => handleInvitation(inv.id, 'decline')}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Updates */}
            <div className="jp-card" id="recent-updates-card">
              <h3 className="jp-update-title">
                <i className="bi bi-clock-history me-2" style={{ color: 'var(--primary-blue)' }}></i>
                Recent Updates
              </h3>
              <div className="jp-update-list">
                {updates.map((upd) => (
                  <div className="jp-update-item" key={upd.id}>
                    <div className={`jp-update-icon ${upd.icon}`}>
                      <i className={`bi ${upd.iconClass}`}></i>
                    </div>
                    <div>
                      <div className="jp-update-heading">{upd.title}</div>
                      <div className="jp-update-desc">{upd.desc}</div>
                      <div className="jp-update-time">{upd.time}</div>
                    </div>
                  </div>
                ))}
                {updates.length === 0 && (
                  <div className="text-center py-3" style={{ fontSize: 13, color: '#94a3b8' }}>
                    No recent updates.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Certificate Modal */}
      {showCertModal && (
        <div className="jp-modal-backdrop" onClick={() => setShowCertModal(false)}>
          <div className="jp-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="jp-modal-header">
              <h5 className="fw-bold text-dark-navy m-0">
                <i className="bi bi-upload me-2" style={{ color: 'var(--primary-blue)' }}></i>
                Add Certificate
              </h5>
              <button className="btn-close shadow-none border-0" onClick={() => setShowCertModal(false)}></button>
            </div>
            <form onSubmit={handleAddCertificate}>
              <div className="jp-modal-body d-flex flex-column gap-3">
                <div>
                  <label className="jp-label">Certificate Name</label>
                  <input
                    type="text"
                    className="jp-input"
                    id="cert-name-input"
                    placeholder="e.g., Professional Jockey License B"
                    value={newCertName}
                    onChange={(e) => setNewCertName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="jp-label">Upload Document</label>
                  <div className="jp-upload-zone">
                    <i className="bi bi-cloud-arrow-up d-block"></i>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-navy)' }}>
                      Drag & drop or click to browse
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      PDF, JPG, or PNG · Max 10 MB
                    </div>
                  </div>
                </div>
              </div>
              <div className="jp-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2"
                  style={{ borderRadius: 10, fontSize: 14, fontWeight: 600 }}
                  onClick={() => setShowCertModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="jp-save-btn"
                  disabled={!newCertName.trim()}
                  style={{ opacity: !newCertName.trim() ? 0.5 : 1 }}
                >
                  <i className="bi bi-cloud-upload"></i>
                  Upload Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Alerts */}
      <div className="jp-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="jp-toast-item">
            <i className="bi bi-check-circle-fill text-success"></i>
            {toast.message}
          </div>
        ))}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-bottom-nav">
        <a href="#race" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('owner-races'); }} className="nav-item-custom">
          <i className="bi bi-flag-fill"></i>
          <span>Races</span>
        </a>
        <a href="#profile" onClick={(e) => e.preventDefault()} className="nav-item-custom active">
          <i className="bi bi-person-circle"></i>
          <span>Profile</span>
        </a>
        <a href="#alerts" onClick={(e) => e.preventDefault()} className="nav-item-custom">
          <i className="bi bi-bell"></i>
          <span>Alerts</span>
        </a>
      </div>
    </div>
  );
}
