import { useState } from 'react';
import '../styles/StableManagement.css';

export default function StableManagement({ onNavigate, horses = [], setHorses }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Filtering & searching states
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal control states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    wins: '',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Open Add modal
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      breed: '',
      age: '',
      weight: '',
      wins: '0',
      status: 'Active',
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Open Edit modal
  const openEditModal = (horse) => {
    setModalMode('edit');
    setSelectedHorse(horse);
    setFormData({
      name: horse.name,
      breed: horse.breed,
      age: horse.age.toString(),
      weight: horse.weight.toString(),
      wins: horse.wins.toString(),
      status: horse.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Horse name is required.';
    }
    if (!formData.breed.trim()) {
      errors.breed = 'Breed is required.';
    }

    const ageNum = parseInt(formData.age, 10);
    if (!formData.age || isNaN(ageNum) || ageNum <= 0) {
      errors.age = 'Age must be a positive number of years.';
    }

    const weightNum = parseInt(formData.weight, 10);
    if (!formData.weight || isNaN(weightNum) || weightNum <= 0) {
      errors.weight = 'Weight must be a positive number of kg.';
    }

    const winsNum = parseInt(formData.wins, 10);
    if (formData.wins === '' || isNaN(winsNum) || winsNum < 0) {
      errors.wins = 'Wins must be 0 or a positive number.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formattedHorse = {
      id: modalMode === 'add' ? Date.now() : selectedHorse.id,
      name: formData.name.trim(),
      breed: formData.breed.trim().toUpperCase(),
      age: parseInt(formData.age, 10),
      weight: parseInt(formData.weight, 10),
      wins: parseInt(formData.wins, 10),
      status: formData.status,
    };

    if (modalMode === 'add') {
      setHorses((prev) => [...prev, formattedHorse]);
    } else {
      setHorses((prev) =>
        prev.map((h) => (h.id === selectedHorse.id ? formattedHorse : h))
      );
    }
    setShowModal(false);
  };

  // Open Delete confirmation
  const openDeleteConfirm = (horse) => {
    setSelectedHorse(horse);
    setShowDeleteConfirm(true);
  };

  // Confirm deletion
  const handleDeleteConfirm = () => {
    setHorses((prev) => prev.filter((h) => h.id !== selectedHorse.id));
    setShowDeleteConfirm(false);
    setSelectedHorse(null);
  };

  // Filter & Search logic
  const filteredHorses = horses.filter((horse) => {
    const matchesStatus =
      activeFilter === 'All' || horse.status === activeFilter;
    const matchesSearch =
      horse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      horse.breed.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="stable-page-wrapper pb-5">
      {/* Header Navigation Bar */}
      <nav className="main-navbar d-flex justify-content-between align-items-center mb-4 py-2 px-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn border-0 p-0 text-dark-navy menu-toggle-btn" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>
            <i className="bi bi-list fs-3"></i>
          </button>
          <span className="brand-logo fs-4 fw-bold text-primary-custom d-flex align-items-center gap-2" style={{ color: 'var(--primary-blue)', letterSpacing: '-0.5px' }}>
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
            <span>Race</span>
          </a>
          <a
            href="#registration"
            onClick={(e) => { e.preventDefault(); }}
            className="nav-item-custom"
          >
            <i className="bi bi-clipboard-check"></i>
            <span>Registration</span>
          </a>
          <a
            href="#horse"
            onClick={(e) => { e.preventDefault(); }}
            className="nav-item-custom active-capsule"
          >
            <svg
              viewBox="0 0 116.9 122.88"
              width="18"
              height="18"
              fill="currentColor"
              style={{ margin: '5px 0 5px 0' }}
            >
              <path d="M25,80.18A33.31,33.31,0,0,0,36.67,94.3a38.86,38.86,0,0,0,43.44.09A33.37,33.37,0,0,0,92,80.18c5.83-13.42,4.56-36.7-1.84-50-1.67-3.46-3.81-6.34-7.25-12.4C80.1,13,78.79,8.63,83.73,4.59A22,22,0,0,1,97.47,0c4.67.14,7.54,3.4,9.14,7.61,1.07,2.78,2.25,8.35,1.5,11.35-.37,1.53-1.16,2-1.65,3-.72,1.46.09,2.95,1.18,5.07,16.4,32,11,69.78-15.88,86.81-17.14,10.86-41.64,11.89-60,3.55C-.75,102.61-8.4,61.46,9.27,27c1.08-2.12,1.89-3.61,1.17-5.07-.49-1-1.27-1.42-1.65-3-.74-3,.44-8.57,1.5-11.35C11.89,3.41,14.76.15,19.43,0A22,22,0,0,1,33.17,4.59c4.94,4,3.63,8.36.87,13.23-3.43,6.06-5.57,8.94-7.25,12.4-6.4,13.26-7.66,36.54-1.84,50ZM21.87,12.29a3.3,3.3,0,1,1-3.3,3.3,3.29,3.29,0,0,1,3.3-3.3Zm36.58,94.77a3.66,3.66,0,1,1-3.65,3.66,3.65,3.65,0,0,1,3.65-3.66Zm41-19.31a3.66,3.66,0,1,1-3.65,3.65,3.65,3.65,0,0,1,3.65-3.65Zm-81.9,0a3.66,3.66,0,1,1-3.65,3.65,3.66,3.66,0,0,1,3.65-3.65Zm88.76-26.1a3.65,3.65,0,1,1-3.66,3.65,3.65,3.65,0,0,1,3.66-3.65Zm-95.61,0A3.65,3.65,0,1,1,7,65.3a3.65,3.65,0,0,1,3.66-3.65Zm91.87-26.11a3.66,3.66,0,1,1-3.66,3.66,3.66,3.66,0,0,1,3.66-3.66Zm-88.13,0a3.66,3.66,0,1,1-3.66,3.66,3.66,3.66,0,0,1,3.66-3.66ZM95,12.29a3.3,3.3,0,1,1-3.3,3.3,3.29,3.29,0,0,1,3.3-3.3Z" />
            </svg>
            <span>Horse</span>
          </a>
          <a
            href="#alerts"
            onClick={(e) => { e.preventDefault(); }}
            className="nav-item-custom"
          >
            <i className="bi bi-bell"></i>
            <span>Alerts</span>
          </a>
          <a
            href="#profile"
            onClick={(e) => { e.preventDefault(); }}
            className="nav-item-custom"
          >
            <i className="bi bi-person-circle"></i>
            <span>Profile</span>
          </a>
        </div>

        {/* Mobile Drawer */}
        {menuOpen && <div className="drawer-overlay" onClick={() => setMenuOpen(false)}></div>}
        <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
          <div className="drawer-header d-flex justify-content-between align-items-center">
            <span className="brand-logo fs-4 fw-bold text-primary-custom d-flex align-items-center gap-2" style={{ color: 'var(--primary-blue)', letterSpacing: '-0.5px' }}>
              HRTMS
            </span>
            <button className="btn-close shadow-none border-0" onClick={() => setMenuOpen(false)} aria-label="Close"></button>
          </div>
          <div className="drawer-body">
            <a
              href="#race"
              onClick={(e) => { e.preventDefault(); setMenuOpen(false); if (onNavigate) onNavigate('owner-races'); }}
              className="drawer-link"
            >
              <i className="bi bi-flag-fill"></i>
              <span>Race</span>
            </a>
            <a
              href="#registration"
              onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}
              className="drawer-link"
            >
              <i className="bi bi-clipboard-check"></i>
              <span>Registration</span>
            </a>
            <a
              href="#horse"
              onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}
              className="drawer-link active"
            >
              <i className="bi bi-award"></i>
              <span>Horse</span>
            </a>
            <a
              href="#alerts"
              onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}
              className="drawer-link"
            >
              <i className="bi bi-bell"></i>
              <span>Alerts</span>
            </a>
            <a
              href="#profile"
              onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}
              className="drawer-link"
            >
              <i className="bi bi-person-circle"></i>
              <span>Profile</span>
            </a>
          </div>
        </div>

        {/* Profile Placeholder Avatar */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-3"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dbeafe',
              border: '1px solid #cbd5e1'
            }}
          ></div>
        </div>
      </nav>

      {/* Main Stable Container */}
      <div className="stable-content-container px-3 px-md-4">

        {/* Title, Description & Action Button Section */}
        <div className="stable-header-section d-flex justify-content-between align-items-center mb-4 mt-2">
          <div>
            <h1 className="stable-title mb-1">My Stable</h1>
            <p className="stable-subtitle mb-0">
              Manage your world-class equine athletes and track performance.
            </p>
          </div>
          <button
            className="btn btn-add-horse d-flex align-items-center gap-2"
            onClick={openAddModal}
          >
            <i className="bi bi-plus-circle fs-5"></i>
            Add New Horse
          </button>
        </div>

        {/* Toolbar: Search and Filter Tabs */}
        <div className="toolbar-card mb-4">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group-custom d-flex align-items-center px-3 py-1 border rounded-3" style={{ backgroundColor: '#ffffff' }}>
                <i className="bi bi-search text-muted me-2"></i>
                <input
                  type="text"
                  className="form-control border-0 p-2 shadow-none"
                  placeholder="Search horse by name or breed..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '14px' }}
                />
                {searchQuery && (
                  <button
                    className="btn border-0 p-0 text-muted"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="col-12 col-md-7 d-flex justify-content-md-end gap-2 overflow-x-auto">
              {['All', 'Active', 'Training', 'Resting'].map((status) => (
                <button
                  key={status}
                  className={`filter-btn ${activeFilter === status ? 'active' : ''}`}
                  onClick={() => setActiveFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Horse Cards List */}
        <div className="d-flex flex-column gap-3 mb-5">
          {filteredHorses.length > 0 ? (
            filteredHorses.map((horse) => (
              <div key={horse.id} className="horse-card p-3 p-md-4">
                <div className="horse-card-layout d-flex justify-content-between align-items-center">

                  {/* Horse Name, Status & Breed */}
                  <div className="horse-name-section d-flex flex-column align-items-start gap-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className="horse-title">{horse.name}</span>
                      <span className={`badge-status ${horse.status.toLowerCase()}`}>
                        {horse.status}
                      </span>
                    </div>
                    <span className="breed-label">{horse.breed}</span>
                  </div>

                  {/* Metrics: Age, Weight, Wins */}
                  <div className="metrics-group d-flex gap-5">
                    <div className="metric-item d-flex flex-column align-items-start">
                      <span className="metric-label">Age</span>
                      <span className="metric-value">{horse.age} Years</span>
                    </div>
                    <div className="metric-item d-flex flex-column align-items-start">
                      <span className="metric-label">Weight</span>
                      <span className="metric-value">{horse.weight} kg</span>
                    </div>
                    <div className="metric-item d-flex flex-column align-items-start">
                      <span className="metric-label">Wins</span>
                      <span className="metric-value">{horse.wins}</span>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete Buttons */}
                  <div className="actions-group d-flex gap-2">
                    <button
                      className="btn btn-action-edit"
                      onClick={() => openEditModal(horse)}
                    >
                      <i className="bi bi-pencil-fill"></i>
                      Edit
                    </button>
                    <button
                      className="btn btn-action-delete"
                      onClick={() => openDeleteConfirm(horse)}
                    >
                      <i className="bi bi-trash-fill"></i>
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-5 bg-white border rounded-4">
              <i className="bi bi-inbox text-muted fs-1 mb-2 d-block"></i>
              <p className="text-secondary-custom fw-semibold mb-0">No horses found matching the filters.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add & Edit Modal */}
      {showModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header-custom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark-navy m-0">
                {modalMode === 'add' ? 'Add New Horse' : 'Edit Horse Details'}
              </h5>
              <button
                className="btn-close shadow-none border-0"
                onClick={() => setShowModal(false)}
              ></button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body-custom d-flex flex-column gap-3">

                {/* Horse Name */}
                <div>
                  <label className="form-label-custom">Horse Name</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-input-custom ${formErrors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Thunder Dash"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {formErrors.name && (
                    <div className="text-danger mt-1">{formErrors.name}</div>
                  )}
                </div>

                {/* Breed */}
                <div>
                  <label className="form-label-custom">Breed</label>
                  <input
                    type="text"
                    name="breed"
                    className={`form-input-custom ${formErrors.breed ? 'is-invalid' : ''}`}
                    placeholder="e.g. THOROUGHBRED"
                    value={formData.breed}
                    onChange={handleInputChange}
                  />
                  {formErrors.breed && (
                    <div className="text-danger mt-1">{formErrors.breed}</div>
                  )}
                </div>

                <div className="row g-3">
                  {/* Age */}
                  <div className="col-6">
                    <label className="form-label-custom">Age (Years)</label>
                    <input
                      type="number"
                      name="age"
                      min="1"
                      className={`form-input-custom ${formErrors.age ? 'is-invalid' : ''}`}
                      placeholder="e.g. 4"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                    {formErrors.age && (
                      <div className="text-danger mt-1">{formErrors.age}</div>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="col-6">
                    <label className="form-label-custom">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      min="1"
                      className={`form-input-custom ${formErrors.weight ? 'is-invalid' : ''}`}
                      placeholder="e.g. 520"
                      value={formData.weight}
                      onChange={handleInputChange}
                    />
                    {formErrors.weight && (
                      <div className="text-danger mt-1">{formErrors.weight}</div>
                    )}
                  </div>
                </div>

                <div className="row g-3">
                  {/* Wins */}
                  <div className="col-6">
                    <label className="form-label-custom">Total Wins</label>
                    <input
                      type="number"
                      name="wins"
                      min="0"
                      className={`form-input-custom ${formErrors.wins ? 'is-invalid' : ''}`}
                      placeholder="e.g. 12"
                      value={formData.wins}
                      onChange={handleInputChange}
                    />
                    {formErrors.wins && (
                      <div className="text-danger mt-1">{formErrors.wins}</div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-6">
                    <label className="form-label-custom">Status</label>
                    <select
                      name="status"
                      className="form-input-custom"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={{
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%2364748b\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m2 5 6 6 6-6\'/%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        backgroundSize: '12px 12px',
                        paddingRight: '40px'
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Training">Training</option>
                      <option value="Resting">Resting</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer-custom d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2"
                  style={{ borderRadius: '10px', fontSize: '14px', fontWeight: '600' }}
                  onClick={() => setShowModal(false)}
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
                >
                  {modalMode === 'add' ? 'Add Horse' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop-custom" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-body-custom text-center p-4">
              <i className="bi bi-exclamation-triangle-fill text-danger fs-1 mb-3 d-block"></i>
              <h4 className="fw-bold text-dark-navy mb-2">Delete Horse?</h4>
              <p className="text-secondary-custom mb-4" style={{ fontSize: '14px' }}>
                Are you sure you want to delete <strong>{selectedHorse?.name}</strong> from your stable? This action cannot be undone.
              </p>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1 py-2 fw-semibold"
                  style={{ borderRadius: '10px', fontSize: '14px' }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger flex-grow-1 py-2 fw-semibold"
                  style={{ borderRadius: '10px', fontSize: '14px' }}
                  onClick={handleDeleteConfirm}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="mobile-bottom-nav">
        <a
          href="#race"
          onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('owner-races'); }}
          className="nav-item-custom"
        >
          <i className="bi bi-flag-fill"></i>
          <span>Race</span>
        </a>
        <a
          href="#registration"
          onClick={(e) => { e.preventDefault(); }}
          className="nav-item-custom"
        >
          <i className="bi bi-clipboard-check"></i>
          <span>Registration</span>
        </a>
        <a
          href="#horse"
          onClick={(e) => { e.preventDefault(); }}
          className="nav-item-custom active"
        >
          <svg
            viewBox="0 0 116.9 122.88"
            width="18"
            height="18"
            fill="currentColor"
            style={{ marginBottom: '2px' }}
          >
            <path d="M25,80.18A33.31,33.31,0,0,0,36.67,94.3a38.86,38.86,0,0,0,43.44.09A33.37,33.37,0,0,0,92,80.18c5.83-13.42,4.56-36.7-1.84-50-1.67-3.46-3.81-6.34-7.25-12.4C80.1,13,78.79,8.63,83.73,4.59A22,22,0,0,1,97.47,0c4.67.14,7.54,3.4,9.14,7.61,1.07,2.78,2.25,8.35,1.5,11.35-.37,1.53-1.16,2-1.65,3-.72,1.46.09,2.95,1.18,5.07,16.4,32,11,69.78-15.88,86.81-17.14,10.86-41.64,11.89-60,3.55C-.75,102.61-8.4,61.46,9.27,27c1.08-2.12,1.89-3.61,1.17-5.07-.49-1-1.27-1.42-1.65-3-.74-3,.44-8.57,1.5-11.35C11.89,3.41,14.76.15,19.43,0A22,22,0,0,1,33.17,4.59c4.94,4,3.63,8.36.87,13.23-3.43,6.06-5.57,8.94-7.25,12.4-6.4,13.26-7.66,36.54-1.84,50ZM21.87,12.29a3.3,3.3,0,1,1-3.3,3.3,3.29,3.29,0,0,1,3.3-3.3Zm36.58,94.77a3.66,3.66,0,1,1-3.65,3.66,3.65,3.65,0,0,1,3.65-3.66Zm41-19.31a3.66,3.66,0,1,1-3.65,3.65,3.65,3.65,0,0,1,3.65-3.65Zm-81.9,0a3.66,3.66,0,1,1-3.65,3.65,3.66,3.66,0,0,1,3.65-3.65Zm88.76-26.1a3.65,3.65,0,1,1-3.66,3.65,3.65,3.65,0,0,1,3.66-3.65Zm-95.61,0A3.65,3.65,0,1,1,7,65.3a3.65,3.65,0,0,1,3.66-3.65Zm91.87-26.11a3.66,3.66,0,1,1-3.66,3.66,3.66,3.66,0,0,1,3.66-3.66Zm-88.13,0a3.66,3.66,0,1,1-3.66,3.66,3.66,3.66,0,0,1,3.66-3.66ZM95,12.29a3.3,3.3,0,1,1-3.3,3.3,3.29,3.29,0,0,1,3.3-3.3Z" />
          </svg>
          <span>Horse</span>
        </a>
        <a
          href="#alerts"
          onClick={(e) => { e.preventDefault(); }}
          className="nav-item-custom"
        >
          <i className="bi bi-bell"></i>
          <span>Alerts</span>
        </a>
        <a
          href="#profile"
          onClick={(e) => { e.preventDefault(); }}
          className="nav-item-custom"
        >
          <i className="bi bi-person-circle"></i>
          <span>Profile</span>
        </a>
      </div>
    </div>
  );
}
