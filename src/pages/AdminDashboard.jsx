import { useState, useRef, useCallback, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '../styles/AdminDashboard.css';
import { tournamentService } from '../services/tournament.service';
import { raceService } from '../services/race.service';

const MOCK_HORSES = [
  'Lightning Strike',
  'Midnight Runner',
  'Golden Gallop',
  'Silver Swift',
  'Bronze Bullet',
  'Stormy Sea',
  'Blazing Star',
  'Shadow Dancer',
  'Wind Whisperer',
  'Eclipse Rider'
];

const MOCK_REFEREES = [
  'John Doe (Ref)',
  'Jane Smith (Ref)',
  'Alice Johnson (Ref)',
  'Bob Brown (Ref)',
  'Charlie Davis (Ref)'
];

export default function AdminDashboard({ onNavigate }) {
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Tournaments');

  // Subview State: 'list' or 'create'
  const [currentSubView, setCurrentSubView] = useState('list');

  // Modal / Form States
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showRaceModal, setShowRaceModal] = useState(false);
  
  // New Tournament Input State
  const [newTourneyName, setNewTourneyName] = useState('');
  const [newTourneyDates, setNewTourneyDates] = useState('');
  
  // New Race Input State
  const [newRaceName, setNewRaceName] = useState('');
  const [newRaceDate, setNewRaceDate] = useState('');
  const [newRaceLaps, setNewRaceLaps] = useState(3);
  const [newRaceStartTime, setNewRaceStartTime] = useState('');
  const [newRaceEndTime, setNewRaceEndTime] = useState('');
  const [newRaceHorse, setNewRaceHorse] = useState('');
  const [newRaceReferee, setNewRaceReferee] = useState('');

  // 'Create Tournament' Page Form States
  const [createTourneyName, setCreateTourneyName] = useState('');
  const [createStartDate, setCreateStartDate] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');
  const [createBreed, setCreateBreed] = useState('Thoroughbred');
  const [createAgeReq, setCreateAgeReq] = useState('');
  const [createDescription, setCreateDescription] = useState('');

  const [selectedTourneyDetails, setSelectedTourneyDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  const getStatusClass = (status) => {
    if (!status) return 'draft';
    const s = status.toLowerCase();
    if (s === 'published') return 'published';
    if (s === 'cancelled') return 'cancelled';
    if (s === 'complet' || s === 'completed') return 'completed';
    if (s === 'pending_referee') return 'pending_referee';
    return 'draft';
  };

  const fetchDashboardTournaments = useCallback(async (autoSelect = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tournamentService.getTournamentDashboard();
      
      let tournamentsList = [];
      if (Array.isArray(data)) {
        tournamentsList = data;
      } else if (data && Array.isArray(data.content)) {
        tournamentsList = data.content;
      } else if (data && Array.isArray(data.data)) {
        tournamentsList = data.data;
      }

      setTournaments(tournamentsList);
      if (tournamentsList.length > 0) {
        if (autoSelect || !selectedId || !tournamentsList.some(t => t.id === selectedId)) {
          setSelectedId(tournamentsList[0].id);
        }
      } else {
        setSelectedId('');
      }
    } catch (err) {
      console.error("Error fetching tournaments:", err);
      setError(err.message || "Failed to load tournaments.");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  const fetchDashboardTournamentsRef = useRef(fetchDashboardTournaments);
  useEffect(() => {
    fetchDashboardTournamentsRef.current = fetchDashboardTournaments;
  }, [fetchDashboardTournaments]);

  useEffect(() => {
    setTimeout(() => {
      fetchDashboardTournamentsRef.current(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setTimeout(() => {
        setSelectedTourneyDetails(null);
      }, 0);
      return;
    }
    
    let active = true;
    const fetchDetails = async () => {
      setTimeout(() => {
        if (active) setLoadingDetails(true);
      }, 0);
      try {
        const details = await raceService.getTournamentRaceDetails(selectedId);
        
        let detailsObj = null;
        if (details) {
          if (details.id || details.races) {
            detailsObj = details;
          } else if (details.data && (details.data.id || details.data.races)) {
            detailsObj = details.data;
          }
        }

        if (active) {
          setTimeout(() => {
            setSelectedTourneyDetails(detailsObj);
          }, 0);
        }
      } catch (err) {
        console.error("Error fetching tournament details:", err);
        if (active) {
          setTimeout(() => {
            setSelectedTourneyDetails(null);
          }, 0);
        }
      } finally {
        if (active) {
          setTimeout(() => {
            setLoadingDetails(false);
          }, 0);
        }
      }
    };
    fetchDetails();

    return () => {
      active = false;
    };
  }, [selectedId]);

  const handleCancelTourney = async (id) => {
    const reason = prompt("Please enter the reason for canceling this tournament:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("A reason is required to cancel the tournament.");
      return;
    }

    try {
      await tournamentService.cancelTournament(id, reason);
      alert("Tournament successfully cancelled.");
      await fetchDashboardTournaments(false);
    } catch (err) {
      console.error("Error canceling tournament:", err);
      alert(err.message || "Failed to cancel tournament.");
    }
  };
  
  const createDescriptionRef = useRef(createDescription);
  useEffect(() => {
    createDescriptionRef.current = createDescription;
  }, [createDescription]);

  const quillRef = useRef(null);
  const editorRef = useCallback((node) => {
    if (node !== null) {
      if (node.classList.contains('ql-container')) {
        return;
      }
      const quill = new Quill(node, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'font': [] }, { 'size': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
          ]
        }
      });
      quillRef.current = quill;

      if (createDescriptionRef.current) {
        quill.root.innerHTML = createDescriptionRef.current;
      }

      quill.on('text-change', () => {
        const html = quill.root.innerHTML;
        setCreateDescription(html === '<p><br></p>' ? '' : html);
      });
    } else {
      quillRef.current = null;
    }
  }, []);

  const [createRacesList, setCreateRacesList] = useState([
    { name: 'Op', date: '', startTime: '', endTime: '', laps: 1, horsesCount: 6, referee: '8' },
    { name: 'Gr', date: '', startTime: '', endTime: '', laps: 2, horsesCount: 8, referee: '12' }
  ]);

  const addCreateRaceRow = () => {
    setCreateRacesList([
      ...createRacesList,
      { name: '', date: '', startTime: '', endTime: '', laps: 3, horsesCount: 8, referee: '' }
    ]);
  };

  const removeCreateRaceRow = (index) => {
    setCreateRacesList(createRacesList.filter((_, i) => i !== index));
  };

  const handleUpdateCreateRace = (index, field, value) => {
    const nextList = [...createRacesList];
    nextList[index][field] = value;
    setCreateRacesList(nextList);
  };

  const handleSaveNewTournament = async (e) => {
    e.preventDefault();
    if (!createTourneyName || !createStartDate || !createEndDate) {
      alert("Please fill in the Tournament Name and Date Range.");
      return;
    }

    try {
      const tourneyPayload = {
        adminId: "admin-1",
        name: createTourneyName,
        startDate: createStartDate,
        endDate: createEndDate,
        allowedBreed: createBreed,
        allowedHorseAge: createAgeReq || "3+",
        status: "PUBLISHED"
      };

      const createdTourney = await tournamentService.createTournament(tourneyPayload);
      const tournamentId = createdTourney.id;

      const racesPayload = {
        tournamentId,
        races: createRacesList.map(r => ({
          name: r.name || 'Race',
          date: r.date || createStartDate,
          startTime: r.startTime || '12:00',
          endTime: r.endTime || '12:30',
          laps: parseInt(r.laps, 10) || 3,
          numHorse: parseInt(r.horsesCount, 10) || 8
        }))
      };

      await raceService.createRacesBatch(racesPayload);
      alert("Tournament and races successfully created.");

      await fetchDashboardTournaments(false);
      setSelectedId(tournamentId);

      // Reset states
      setCreateTourneyName('');
      setCreateStartDate('');
      setCreateEndDate('');
      setCreateBreed('Thoroughbred');
      setCreateAgeReq('');
      setCreateDescription('');
      setCreateRacesList([
        { name: 'Op', date: '', startTime: '', endTime: '', laps: 1, horsesCount: 6, referee: '8' },
        { name: 'Gr', date: '', startTime: '', endTime: '', laps: 2, horsesCount: 8, referee: '12' }
      ]);
      
      setCurrentSubView('list');
    } catch (err) {
      console.error("Error creating tournament and races:", err);
      alert(err.message || "Failed to create tournament.");
    }
  };

  const selectedTourney = tournaments.find(t => t.id === selectedId) || tournaments[0] || { races: [] };
  const displayTourney = selectedTourneyDetails || selectedTourney;

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!newTourneyName || !newTourneyDates) return;

    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const tourneyPayload = {
        adminId: "admin-1",
        name: newTourneyName,
        startDate: todayStr,
        endDate: todayStr,
        allowedBreed: "Thoroughbred",
        allowedHorseAge: "3+",
        status: "DRAFT"
      };

      const createdTourney = await tournamentService.createTournament(tourneyPayload);
      alert("Draft tournament successfully created.");

      await fetchDashboardTournaments(false);
      setSelectedId(createdTourney.id);
      setNewTourneyName('');
      setNewTourneyDates('');
      setShowTournamentModal(false);
    } catch (err) {
      console.error("Error creating draft tournament:", err);
      alert(err.message || "Failed to create draft tournament.");
    }
  };

  const handleAddRace = async (e) => {
    e.preventDefault();
    if (!newRaceName || !newRaceStartTime || !newRaceEndTime) return;

    try {
      const racePayload = {
        tournamentId: selectedId,
        races: [
          {
            name: newRaceName,
            date: newRaceDate || new Date().toISOString().split('T')[0],
            startTime: newRaceStartTime,
            endTime: newRaceEndTime,
            laps: parseInt(newRaceLaps, 10) || 3,
            numHorse: parseInt(newRaceHorse, 10) || 8
          }
        ]
      };

      await raceService.createRacesBatch(racePayload);
      alert("Race successfully added.");
      
      await fetchDashboardTournaments(false);
      const details = await raceService.getTournamentRaceDetails(selectedId);
      setSelectedTourneyDetails(details);

      setNewRaceName('');
      setNewRaceDate('');
      setNewRaceLaps(3);
      setNewRaceStartTime('');
      setNewRaceEndTime('');
      setNewRaceHorse('');
      setNewRaceReferee('');
      setShowRaceModal(false);
    } catch (err) {
      console.error("Error adding race:", err);
      alert(err.message || "Failed to add race.");
    }
  };

  const menuItems = [
    { name: 'Tournament management', icon: 'bi-trophy' },
    { name: 'Approve application', icon: 'bi-file-earmark-check' },
    { name: 'Verify profile Jockey', icon: 'bi-shield-check' },
    { name: 'Healthcheck management', icon: 'bi-activity' },
    { name: 'Incident management', icon: 'bi-exclamation-triangle' }
  ];

  return (
    <div className="admin-container d-flex">
      
      {/* ── Mobile Header/Navbar ── */}
      <header className="mobile-admin-header d-flex d-lg-none justify-content-between align-items-center px-3 py-2 bg-white border-bottom w-100 position-fixed top-0 start-0 z-3">
        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn border-0 p-1 text-dark-navy" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Menu"
          >
            <i className="bi bi-list fs-2"></i>
          </button>
          <span className="brand-logo fs-5 fw-bold text-primary-custom d-flex align-items-center gap-1">
            <i className="bi bi-award-fill"></i> HRTMS
          </span>
        </div>
        {currentSubView === 'list' && (
          <button 
            className="btn btn-primary btn-sm px-3 py-2 fw-bold"
            onClick={() => setCurrentSubView('create')}
            style={{ fontSize: '12px', borderRadius: '6px' }}
          >
            + CREATE
          </button>
        )}
      </header>

      {/* ── Left Sidebar ── */}
      <aside className={`admin-sidebar bg-white border-end d-flex flex-column justify-content-between ${sidebarOpen ? 'open' : ''}`}>
        <div>
          {/* Logo Section */}
          <div className="sidebar-logo d-flex align-items-center gap-2.5 p-4 border-bottom">
            <div className="rounded" style={{ width: '36px', height: '36px', minWidth: '36px', backgroundColor: '#e2e8f0' }}></div>
            <div>
              <span className="brand-title fw-bold text-dark-navy m-0 d-block" style={{ fontSize: '17px', lineHeight: '1.2', letterSpacing: '-0.3px' }}>HRTMS</span>
              <span className="text-secondary-custom" style={{ fontSize: '11px' }}>Global Dashboard</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav p-3">
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {menuItems.map(item => (
                <li key={item.name}>
                  <button
                    className={`w-100 sidebar-link border-0 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-semibold ${activeMenu === item.name || (activeMenu === 'Tournaments' && item.name === 'Tournament management') ? 'active' : ''}`}
                    onClick={() => {
                      setActiveMenu(item.name);
                      setCurrentSubView('list');
                      setSidebarOpen(false);
                    }}
                  >
                    <i className={`bi ${item.icon} fs-5`}></i>
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Back / Sign Out Button */}
        <div className="sidebar-footer p-3 border-top">
          {currentSubView === 'create' ? (
            <button 
              className="w-100 sign-out-btn border-0 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-semibold text-danger bg-transparent"
              onClick={() => setCurrentSubView('list')}
            >
              <i className="bi bi-arrow-left fs-5"></i>
              <span>Back</span>
            </button>
          ) : (
            <button 
              className="w-100 sign-out-btn border-0 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-semibold text-danger bg-transparent"
              onClick={() => {
                if (window.confirm("Are you sure you want to sign out?")) {
                  onNavigate('login');
                }
              }}
            >
              <i className="bi bi-box-arrow-left fs-5"></i>
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay d-lg-none" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ── Main Content Area ── */}
      <main className="admin-main flex-grow-1 bg-cool-gray p-3 p-md-4">
        
        {/* Header (Desktop only) */}
        <div className="admin-main-header d-none d-lg-flex justify-content-between align-items-center mb-4">
          <h2 className="h5 fw-bold text-dark-navy m-0" style={{ letterSpacing: '-0.3px' }}>Tournament Management</h2>
          <div className="d-flex align-items-center gap-3">
            {currentSubView === 'list' && (
              <button 
                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2.5 fw-bold"
                onClick={() => setCurrentSubView('create')}
                style={{ borderRadius: '8px', fontSize: '14px', letterSpacing: '0.5px' }}
              >
                <i className="bi bi-plus-lg fs-5"></i>
                <span>CREATE NEW TOURNAMENT</span>
              </button>
            )}
            <i className="bi bi-person-circle fs-4 text-secondary-custom"></i>
          </div>
        </div>

        {/* Dynamic content placeholder - for simulation, we focus on Tournaments menu */}
        {activeMenu === 'Tournaments' || activeMenu === 'Tournament management' ? (
          currentSubView === 'create' ? (
            /* ── Create New Tournament Subview ── */
            <div className="create-tournament-view">
              {/* Breadcrumbs */}
              <div className="admin-breadcrumb mb-2" style={{ fontSize: '13px', fontWeight: '500' }}>
                <span className="cursor-pointer" onClick={() => setCurrentSubView('list')} style={{ cursor: 'pointer', color: '#64748b' }}>Admin</span>
                <span className="mx-2 text-muted">&gt;</span>
                <span className="cursor-pointer" onClick={() => setCurrentSubView('list')} style={{ cursor: 'pointer', color: '#64748b' }}>Tournaments</span>
                <span className="mx-2 text-muted">&gt;</span>
                <span className="text-dark fw-bold">New</span>
              </div>
              <h1 className="h3 fw-bold text-dark-navy mb-4">Create New Tournament</h1>

              <form onSubmit={handleSaveNewTournament}>
                {/* Section 1: Tournament Details */}
                <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4 create-section-card">
                  <h3 className="h5 fw-bold text-dark-navy mb-3 create-section-title">Tournament Details</h3>
                  
                  <div className="row g-3">
                    {/* Tournament Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label text-secondary-custom fw-semibold mb-1.5" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>
                        Tournament Name
                      </label>
                      <input 
                        type="text" 
                        className="form-control py-2 px-3 form-input-custom"
                        placeholder="e.g., Royal Ascot 2024"
                        value={createTourneyName}
                        onChange={(e) => setCreateTourneyName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Date Range */}
                    <div className="col-12 col-md-6">
                      <label className="form-label text-secondary-custom fw-semibold mb-1.5" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>
                        Date Range
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <div className="input-group input-group-custom">
                          <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderColor: '#cbd5e1' }}>
                            <i className="bi bi-calendar"></i>
                          </span>
                          <input 
                            type="date" 
                            className="form-control py-2 border-start-0 form-input-custom ps-0"
                            value={createStartDate}
                            onChange={(e) => setCreateStartDate(e.target.value)}
                            required
                          />
                        </div>
                        <span className="text-secondary-custom" style={{ fontSize: '13px' }}>to</span>
                        <div className="input-group input-group-custom">
                          <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderColor: '#cbd5e1' }}>
                            <i className="bi bi-calendar"></i>
                          </span>
                          <input 
                            type="date" 
                            className="form-control py-2 border-start-0 form-input-custom ps-0"
                            value={createEndDate}
                            onChange={(e) => setCreateEndDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Allowed Horse Breeds */}
                    <div className="col-12 col-md-6">
                      <label className="form-label text-secondary-custom fw-semibold mb-1.5" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>
                        Allowed Horse Breeds
                      </label>
                      <select 
                        className="form-select py-2 px-3 form-input-custom"
                        value={createBreed}
                        onChange={(e) => setCreateBreed(e.target.value)}
                      >
                        <option value="Thoroughbred">Thoroughbred</option>
                        <option value="Quarter Horse">Quarter Horse</option>
                        <option value="Arabian">Arabian</option>
                        <option value="Standardbred">Standardbred</option>
                      </select>
                    </div>

                    {/* Horse Age Requirement */}
                    <div className="col-12 col-md-6">
                      <label className="form-label text-secondary-custom fw-semibold mb-1.5" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>
                        Horse Age Requirement (Years)
                      </label>
                      <input 
                        type="text" 
                        className="form-control py-2 px-3 form-input-custom"
                        placeholder="e.g., 3+"
                        value={createAgeReq}
                        onChange={(e) => setCreateAgeReq(e.target.value)}
                      />
                    </div>

                    {/* Tournament Description */}
                    <div className="col-12">
                      <label className="form-label text-secondary-custom fw-semibold mb-1.5" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>
                        Tournament Description
                      </label>
                      <div className="quill-editor-container">
                        <div id="editor" ref={editorRef}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Races */}
                <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4 create-section-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h5 fw-bold text-dark-navy m-0 create-section-title">Races</h3>
                    <button 
                      type="button" 
                      className="add-race-row-btn d-flex align-items-center gap-1"
                      onClick={addCreateRaceRow}
                    >
                      <i className="bi bi-plus-lg"></i> Add Race Row
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table align-middle races-creation-table mb-0">
                      <thead>
                        <tr>
                          <th scope="col" style={{ minWidth: '100px' }}>Race Name</th>
                          <th scope="col" style={{ minWidth: '130px' }}>Date</th>
                          <th scope="col" style={{ minWidth: '110px' }}>Start Time</th>
                          <th scope="col" style={{ minWidth: '110px' }}>End Time</th>
                          <th scope="col" style={{ minWidth: '80px' }}>Laps</th>
                          <th scope="col" style={{ minWidth: '80px' }}>Horses</th>
                          <th scope="col" style={{ minWidth: '100px' }}>Referee</th>
                          <th scope="col" style={{ minWidth: '120px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {createRacesList.length > 0 ? (
                          createRacesList.map((race, index) => (
                            <tr key={index}>
                              <td>
                                <input 
                                  type="text" 
                                  className="table-input-custom"
                                  placeholder="e.g. Op"
                                  value={race.name}
                                  onChange={(e) => handleUpdateCreateRace(index, 'name', e.target.value)}
                                  required
                                />
                              </td>
                              <td>
                                <input 
                                  type="date" 
                                  className="table-input-custom"
                                  value={race.date}
                                  onChange={(e) => handleUpdateCreateRace(index, 'date', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="time" 
                                  className="table-input-custom"
                                  value={race.startTime}
                                  onChange={(e) => handleUpdateCreateRace(index, 'startTime', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="time" 
                                  className="table-input-custom"
                                  value={race.endTime}
                                  onChange={(e) => handleUpdateCreateRace(index, 'endTime', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  className="table-input-custom text-center"
                                  value={race.laps}
                                  min="1"
                                  onChange={(e) => handleUpdateCreateRace(index, 'laps', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  className="table-input-custom text-center"
                                  value={race.horsesCount}
                                  min="1"
                                  onChange={(e) => handleUpdateCreateRace(index, 'horsesCount', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="text" 
                                  className="table-input-custom text-center"
                                  placeholder="e.g. 8"
                                  value={race.referee}
                                  onChange={(e) => handleUpdateCreateRace(index, 'referee', e.target.value)}
                                />
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <button 
                                    type="button" 
                                    className="btn btn-sm btn-outline-secondary px-2.5 py-1 text-secondary-custom border-light-gray" 
                                    style={{ fontSize: '12.5px', borderRadius: '6px', backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}
                                  >
                                    Referee
                                  </button>
                                  {createRacesList.length > 1 && (
                                    <button 
                                      type="button" 
                                      className="action-delete-btn text-secondary-custom"
                                      onClick={() => removeCreateRaceRow(index)}
                                      aria-label="Delete Race Row"
                                      style={{ padding: '4px 8px', borderRadius: '6px' }}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center py-4 text-muted border border-dashed rounded-3">
                              No races added. Use "+ Add Race Row" to create races.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="d-flex justify-content-end gap-3 mt-4">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4 py-2"
                    onClick={() => setCurrentSubView('list')}
                    style={{ borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4 py-2 fw-bold"
                    style={{ borderRadius: '8px' }}
                  >
                    Save Tournament
                  </button>
                </div>

              </form>
            </div>
          ) : (
            /* ── Active Tournaments List Subview ── */
            <div className="row g-4 mt-2 mt-lg-0">

            
            {/* Left Column: Active Tournaments Table */}
            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <h1 className="h4 fw-bold text-dark-navy m-0">Active Tournaments</h1>
                  <span className="text-secondary-custom" style={{ fontSize: '13px' }}>
                    Showing {tournaments.length} active tournaments
                  </span>
                </div>

                {/* Tournament List Table */}
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger my-3" role="alert">
                    {error}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle custom-tourney-table mb-0">
                      <thead>
                        <tr>
                          <th scope="col" className="text-secondary-custom fw-semibold">TOURNAMENT DETAILS</th>
                          <th scope="col" className="text-secondary-custom fw-semibold">DATES</th>
                          <th scope="col" className="text-secondary-custom fw-semibold d-none d-md-table-cell">RACES</th>
                          <th scope="col" className="text-secondary-custom fw-semibold d-none d-md-table-cell">STATUS</th>
                          <th scope="col" style={{ width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {tournaments.map(t => (
                          <tr 
                            key={t.id}
                            className={`tourney-row-item ${selectedId === t.id ? 'table-active-selected' : ''}`}
                            onClick={() => setSelectedId(t.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <div className="fw-bold text-dark-navy tourney-title">{t.name}</div>
                              <div className="text-secondary-custom font-monospace" style={{ fontSize: '11px' }}>{t.id}</div>
                            </td>
                            <td className="fw-semibold text-secondary-custom">{t.dates || (t.startDate && t.endDate ? `${t.startDate} - ${t.endDate}` : '') || (t.start_date && t.end_date ? `${t.start_date} - ${t.end_date}` : 'No dates set')}</td>
                            <td className="fw-semibold text-dark-navy d-none d-md-table-cell">{t.raceCount !== undefined ? t.raceCount : t.race_count !== undefined ? t.race_count : 0} Races</td>
                            <td className="d-none d-md-table-cell">
                              <span className={`status-badge-custom ${getStatusClass(t.status)}`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="text-end text-muted pe-3">
                              <i className="bi bi-chevron-right fs-5"></i>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Selected Tournament Details Sidebar */}
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm rounded-3 bg-white h-100 overflow-hidden">
                {loadingDetails ? (
                  <div className="d-flex align-items-center justify-content-center h-100 py-5 my-auto" style={{ minHeight: '300px' }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading details...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Details Header */}
                    <div className="card-header bg-white border-bottom p-4">
                      <h3 className="h5 fw-bold text-dark-navy mb-4">Tournament Details</h3>
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-secondary-custom fw-semibold" style={{ fontSize: '13px' }}>STATUS</span>
                          <span className={`status-badge-custom ${getStatusClass(displayTourney.status)}`}>
                            {displayTourney.status}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-secondary-custom fw-semibold" style={{ fontSize: '13px' }}>TOTAL ENTRIES</span>
                          <span className="fw-bold text-dark-navy">{displayTourney.totalEntries || displayTourney.total_entries || '0 Horses'}</span>
                        </div>
                        {displayTourney.id && displayTourney.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm w-100 mt-2 py-2 fw-semibold"
                            onClick={() => handleCancelTourney(displayTourney.id)}
                            style={{ borderRadius: '6px' }}
                          >
                            <i className="bi bi-x-circle me-1.5"></i> Cancel Tournament
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Race Schedule */}
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="text-uppercase fw-bold text-secondary-custom m-0" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                          RACE SCHEDULE ({(displayTourney.races || []).length})
                        </h4>
                        {displayTourney.status !== 'CANCELLED' && (
                          <button 
                            className="btn btn-link text-decoration-none p-0 text-primary-custom fw-semibold d-flex align-items-center gap-1"
                            onClick={() => setShowRaceModal(true)}
                            style={{ fontSize: '13px' }}
                          >
                            <i className="bi bi-plus-lg"></i> Add new races
                          </button>
                        )}
                      </div>

                      {/* Races list */}
                      <div className="d-flex flex-column gap-3">
                        {(displayTourney.races || []).length > 0 ? (
                          displayTourney.races.map(race => (
                            <div key={race.id} className="race-schedule-box p-3 rounded-3 border">
                              <div className="d-flex justify-content-between align-items-start gap-2 mb-2 flex-wrap">
                                <h5 className="fw-bold text-dark-navy m-0" style={{ fontSize: '15px' }}>{race.name}</h5>
                                <div className="d-flex gap-1.5 flex-wrap">
                                  <span className="badge-custom-code">{race.code}</span>
                                  <span className={`status-badge-custom ${(race.status || 'PUBLISHED').toLowerCase()}`}>
                                    {race.status || 'PUBLISHED'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-secondary-custom d-flex align-items-center gap-1.5" style={{ fontSize: '12px' }}>
                                <i className="bi bi-clock"></i>
                                <span>{race.time || (race.startTime && race.endTime ? `${race.startTime} - ${race.endTime}` : '12:00 - 12:30')} • <strong>{race.laps || 3} Laps</strong></span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-5 text-muted border border-dashed rounded-3">
                            <i className="bi bi-clipboard-x fs-1 mb-2 d-block"></i>
                            <span>No races scheduled yet</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )
      ) : (
        <div className="card border-0 shadow-sm rounded-3 p-5 text-center bg-white mt-2 mt-lg-0">
            <i className="bi bi-gear-wide-connected fs-1 text-muted mb-3 d-block"></i>
            <h2 className="h4 fw-bold text-dark-navy mb-2">{activeMenu}</h2>
            <p className="text-secondary-custom max-width-md mx-auto mb-0" style={{ fontSize: '14px' }}>
              This section is currently being simulated. Only the <strong>Tournaments</strong> menu is active for this mock.
            </p>
          </div>
        )}
      </main>

      {/* ── Add Tournament Modal ── */}
      {showTournamentModal && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center">
          <div className="modal-card-custom bg-white p-4 rounded-3 shadow-lg position-relative border">
            <button 
              className="btn-close position-absolute top-0 end-0 m-3"
              onClick={() => setShowTournamentModal(false)}
              aria-label="Close"
            ></button>
            <h4 className="fw-bold text-dark-navy mb-3">Create New Tournament</h4>
            
            <form onSubmit={handleCreateTournament}>
              <div className="mb-3">
                <label className="form-label text-secondary-custom fw-semibold" style={{ fontSize: '13px' }}>Tournament Name</label>
                <input 
                  type="text" 
                  className="form-control py-2 px-3"
                  placeholder="e.g. Royal Ascot Invitational"
                  value={newTourneyName}
                  onChange={(e) => setNewTourneyName(e.target.value)}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary-custom fw-semibold" style={{ fontSize: '13px' }}>Tournament Dates</label>
                <input 
                  type="text" 
                  className="form-control py-2 px-3"
                  placeholder="e.g. Nov 02 - Nov 05"
                  value={newTourneyDates}
                  onChange={(e) => setNewTourneyDates(e.target.value)}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button 
                  type="button" 
                  className="btn btn-light px-4" 
                  onClick={() => setShowTournamentModal(false)}
                  style={{ borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary px-4 fw-bold"
                  style={{ borderRadius: '8px' }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Race Modal ── */}
      {showRaceModal && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center">
          <div className="modal-card-custom bg-white rounded-3 shadow-lg position-relative border overflow-hidden" style={{ maxWidth: '400px' }}>
            
            {/* Modal Header */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <h4 className="fw-bold text-dark-navy mb-0" style={{ fontSize: '18px' }}>Add New Race</h4>
              <button 
                type="button"
                className="btn-close"
                onClick={() => setShowRaceModal(false)}
                aria-label="Close"
              ></button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleAddRace} className="p-4">
              
              {/* Race Name */}
              <div className="mb-3">
                <label className="form-label text-secondary-custom fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                  RACE NAME
                </label>
                <input 
                  type="text" 
                  className="form-control py-2 px-3 border-light-gray"
                  placeholder="e.g. Platinum Jubilee Stakes"
                  value={newRaceName}
                  onChange={(e) => setNewRaceName(e.target.value)}
                  required
                  style={{ borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              {/* Date & Laps */}
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label text-secondary-custom fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    DATE
                  </label>
                  <input 
                    type="date" 
                    className="form-control py-2 px-2 border-light-gray"
                    value={newRaceDate}
                    onChange={(e) => setNewRaceDate(e.target.value)}
                    required
                    style={{ borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary-custom fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    LAPS
                  </label>
                  <input 
                    type="number" 
                    className="form-control py-2 px-3 border-light-gray"
                    value={newRaceLaps}
                    onChange={(e) => setNewRaceLaps(e.target.value)}
                    required
                    min="1"
                    style={{ borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Start Time & End Time */}
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label text-secondary-custom fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    START TIME
                  </label>
                  <input 
                    type="time" 
                    className="form-control py-2 px-2 border-light-gray"
                    value={newRaceStartTime}
                    onChange={(e) => setNewRaceStartTime(e.target.value)}
                    required
                    style={{ borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary-custom fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    END TIME
                  </label>
                  <input 
                    type="time" 
                    className="form-control py-2 px-2 border-light-gray"
                    value={newRaceEndTime}
                    onChange={(e) => setNewRaceEndTime(e.target.value)}
                    required
                    style={{ borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Horse */}
              <div className="mb-3">
                <label className="form-label text-secondary-custom fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                  HORSE
                </label>
                <select 
                  className="form-select py-2 px-3 border-light-gray"
                  value={newRaceHorse}
                  onChange={(e) => setNewRaceHorse(e.target.value)}
                  style={{ borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">Select Horse</option>
                  {MOCK_HORSES.map((h, index) => (
                    <option key={index} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Referee */}
              <div className="mb-4">
                <label className="form-label text-secondary-custom fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                  REFEREE
                </label>
                <select 
                  className="form-select py-2 px-3 border-light-gray"
                  value={newRaceReferee}
                  onChange={(e) => setNewRaceReferee(e.target.value)}
                  style={{ borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">Select Referee</option>
                  {MOCK_REFEREES.map((r, index) => (
                    <option key={index} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2.5 fw-bold text-uppercase text-center"
                style={{ borderRadius: '6px', fontSize: '13px', letterSpacing: '0.5px' }}
              >
                ADD NEW RACE
              </button>

            </form>
          </div>
        </div>
      )}


    </div>
  );
}
