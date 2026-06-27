import { useState, useEffect } from 'react';
import { jockeyService } from '../services/jockey.service';
import '../styles/JockeyProfile.css';
import { useQuery, useQueryClient } from '@tanstack/react-query';


// ─── Fallback Mock Data (used when API is unavailable) ───
const FALLBACK_PROFILE = {
  id: null,
  name: 'Marcus Sterling',
  yearsExp: 8,
  age: 28,
  bio: 'Specializing in high-stakes sprint races. Known for strategic positioning and maintaining composure in tight fields. Consistently ranking in the top 10% for the past three seasons.',
};


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

/**
 * Map API response data → local profile state shape
 */
function mapApiToProfile(data) {
  return {
    id: data.id,
    name: data.jockeyName || '',
    yearsExp: data.yearOfExperience ?? 0,
    age: data.age ?? 0,
    bio: data.professionalBio || '',
    email: data.email || '',
    username: data.username || '',
    status: data.status,
  };
}

export default function JockeyProfile({ onNavigate, jockeyId = 4 }) {
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [certificates, setCertificates] = useState([]);
  const [invitations, setInvitations] = useState(INITIAL_INVITATIONS);
  const [updates, setUpdates] = useState(INITIAL_UPDATES);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [newCertFile, setNewCertFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [error, setError] = useState(null);
  // THÊM CODE: Khởi tạo queryClient
  const queryClient = useQueryClient();

  // THÊM CODE: Hook useQuery quản lý việc lấy danh sách chứng chỉ tự động
  const { data: reactQueryCerts } = useQuery({
    queryKey: ['certificates', jockeyId],
    queryFn: () => jockeyService.getJockeyCertificates(jockeyId),
    enabled: !!jockeyId,
  });

  // THÊM CODE: Bắt sự kiện mỗi khi React Query tự động lấy được data mới -> đồng bộ vào state cũ của cậu
  useEffect(() => {
    if (reactQueryCerts && reactQueryCerts.data) {
      const newCerts = reactQueryCerts.data.map((c) => ({
        id: c.cert_id,
        name: c.cert_name || `Certificate ${c.cert_id}`,
        status: c.status ? c.status.toLowerCase() : 'pending',
        image: c.cert_image_base64 ? `data:image/jpeg;base64,${c.cert_image_base64}` : null
      }));
      setCertificates(newCerts); // Cập nhật vào state cũ không cần xóa code
    }
  }, [reactQueryCerts]);

  // ─── Fetch profile from API on mount ───
  useEffect(() => {
    if (!jockeyId) return; // skip if no jockeyId provided (dev mode)

    setLoading(true);
    setError(null);

    Promise.all([
      jockeyService.getProfile(jockeyId),
      jockeyService.getCertificateResults(jockeyId).catch((err) => {
        console.warn('Failed to fetch certificate results:', err);
        return { data: [] }; // fallback
      }),
      jockeyService.getJockeyCertificates(jockeyId).catch((err) => {
        console.warn('Failed to fetch certificates:', err);
        return { data: [] };
      })
    ])
      .then(([profileRes, notifRes, certsRes]) => {
        // Handle profile
        const data = profileRes.data ?? profileRes;
        setProfile(mapApiToProfile(data));

        // Handle notifications
        const notifs = notifRes.data ?? [];
        if (notifs && notifs.length > 0) {
          const apiUpdates = notifs.map((n, i) => {
            const isAccepted = n.type === 'ACCEPT_CERTIFICATE';
            const isRejected = n.type === 'REJECT_CERTIFICATE';

            let iconType = 'info';
            let iconClass = 'bi-info-circle-fill';

            if (isAccepted) {
              iconType = 'success';
              iconClass = 'bi-check-circle-fill';
            } else if (isRejected) {
              iconType = 'error';
              iconClass = 'bi-x-circle-fill';
            }

            return {
              id: `api-notif-${i}-${Date.now()}`,
              icon: iconType,
              iconClass: iconClass,
              title: n.title,
              desc: n.content,
              time: new Date(n.createdAt).toLocaleString(),
            };
          });
          setUpdates(apiUpdates);
        }

        // Handle certificates
        const certData = certsRes?.data || [];
        const newCerts = certData.map((c) => ({
          id: c.cert_id,
          name: c.cert_name || `Certificate ${c.cert_id}`,
          status: c.status ? c.status.toLowerCase() : 'pending',
          image: c.cert_image_base64 ? `data:image/jpeg;base64,${c.cert_image_base64}` : null
        }));

        setCertificates(newCerts);
      })
      .catch((err) => {
        console.error('Failed to fetch jockey profile:', err);
        setError(err.message || 'Failed to load profile');
        // keep fallback data so the UI stays usable
      })
      .finally(() => setLoading(false));
  }, [jockeyId]);

  // Show a toast notification
  const showToast = (message, type = 'success') => {
    const toast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 3500);
  };

  // Handle profile field change
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Save profile — calls API when jockeyId is available
  const handleSaveProfile = async () => {
    if (jockeyId) {
      setSaving(true);
      try {
        await jockeyService.updateProfile(jockeyId, {
          jockeyName: profile.name,
          yearOfExperience: Number(profile.yearsExp),
          age: Number(profile.age),
          professionalBio: profile.bio,
        });
        showToast('Profile changes saved successfully!');
      } catch (err) {
        console.error('Failed to save profile:', err);
        showToast(err.message || 'Failed to save profile', 'error');
      } finally {
        setSaving(false);
      }
    } else {
      // Dev / demo mode — no API call
      showToast('Profile changes saved successfully!');
    }
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
  const handleAddCertificate = async (e) => {
    e.preventDefault();
    if (!newCertName.trim() || !newCertFile) {
      showToast('Please enter a name and select a file', 'warning');
      return;
    }

    if (!jockeyId) {
      showToast('No jockey context to upload certificate', 'error');
      return;
    }

    setUploadingCert(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result.split(',')[1];

        try {
          await jockeyService.addCertificate(jockeyId, {
            certName: newCertName.trim(),
            certImageBase64: base64String
          });
          // THÊM DÒNG NÀY: Ra lệnh báo cho React Query biết data cũ đã hết hạn
          // React Query sẽ ngầm tự động gọi lại API và cập nhật lại giao diện ngay lập tức!
          queryClient.invalidateQueries({ queryKey: ['certificates', jockeyId] });
          const cert = {
            id: Date.now(),
            name: newCertName.trim(),
            status: 'pending',
            image: null,
          };
          setCertificates((prev) => [...prev, cert]);
          setShowCertModal(false);
          setNewCertName('');
          setNewCertFile(null);
          showToast(`Certificate "${cert.name}" uploaded successfully.`);

          setUpdates((prev) => [
            {
              id: Date.now(),
              icon: 'warning',
              iconClass: 'bi-hourglass-split',
              title: 'Verification Requested',
              desc: `${cert.name} is uploaded and awaiting verification from Admin.`,
              time: 'Just now',
            },
            ...prev,
          ]);
        } catch (err) {
          console.error('Failed to add certificate', err);
          showToast(err.message || 'Failed to upload certificate', 'error');
        } finally {
          setUploadingCert(false);
        }
      };
      reader.readAsDataURL(newCertFile);
    } catch (err) {
      console.error('Error reading file', err);
      showToast('Error processing file', 'error');
      setUploadingCert(false);
    }
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

      {/* Loading Overlay */}
      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && !loading && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mx-auto mt-3" style={{ maxWidth: 1100, borderRadius: 12, fontSize: 14 }}>
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error} — showing demo data.</span>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
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
                    disabled={saving}
                    style={{ opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-floppy"></i>
                        Save Changes
                      </>
                    )}
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
                      {/* Certificate image or placeholder */}
                      <div className="jp-cert-image d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                        {cert.image ? (
                          <img src={cert.image} alt={cert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '12px' }}>
                            <i className="bi bi-file-earmark-richtext" style={{ fontSize: '32px', color: '#94a3b8' }}></i>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certificate</div>
                          </div>
                        )}
                      </div>
                      <div className="jp-cert-info">
                        <span className="jp-cert-name">{cert.name}</span>
                        <span className={`jp-cert-badge ${cert.status}`}>
                          {cert.status === 'verified' && <><i className="bi bi-check-circle-fill me-1"></i>Verified</>}
                          {cert.status === 'pending' && <><i className="bi bi-clock-fill me-1"></i>Pending</>}
                          {cert.status === 'expired' && <><i className="bi bi-x-circle-fill me-1"></i>Expired</>}
                          {cert.status === 'rejected' && <><i className="bi bi-exclamation-circle-fill me-1"></i>Rejected</>}
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
      )}

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
                  <label className="jp-upload-zone w-100 d-block m-0" style={{ cursor: 'pointer' }}>
                    <input
                      type="file"
                      className="d-none"
                      accept="image/png, image/jpeg, application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewCertFile(e.target.files[0]);
                        }
                      }}
                    />
                    <i className="bi bi-cloud-arrow-up d-block"></i>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-navy)' }}>
                      {newCertFile ? newCertFile.name : 'Drag & drop or click to browse'}
                    </div>
                    {!newCertFile && (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        PDF, JPG, or PNG · Max 10 MB
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="jp-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2"
                  style={{ borderRadius: 10, fontSize: 14, fontWeight: 600 }}
                  onClick={() => setShowCertModal(false)}
                  disabled={uploadingCert}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="jp-save-btn"
                  disabled={!newCertName.trim() || !newCertFile || uploadingCert}
                  style={{ opacity: (!newCertName.trim() || !newCertFile || uploadingCert) ? 0.5 : 1 }}
                >
                  {uploadingCert ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</>
                  ) : (
                    <><i className="bi bi-cloud-upload"></i>Upload Certificate</>
                  )}
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
