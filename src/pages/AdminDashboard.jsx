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

  // Nav
  const [activeMenu, setActiveMenu] = useState("Tournaments");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New Race State
  const [newRaceName, setNewRaceName] = useState("");
  const [newRaceDate, setNewRaceDate] = useState("");
  const [newRaceLaps, setNewRaceLaps] = useState(3);
  const [newRaceStartTime, setNewRaceStartTime] = useState("");
  const [newRaceEndTime, setNewRaceEndTime] = useState("");
  const [newRaceHorsesCount, setNewRaceHorsesCount] = useState(8);
  const [newRaceRefereeId, setNewRaceRefereeId] = useState("");

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
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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
    if (!editingRaceId) return;

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

  const handleUpdateTournament = (e) => {
    e.preventDefault();
    if (!selectedId) return;

    const payload = {
      tournament_name: editTourneyName,
      start_date: editTourneyStartDate,
      end_date: editTourneyEndDate,
      allowed_horse_breed: editTourneyBreed,
      horse_age_requirement: Number(editTourneyAgeReq),
      tournament_description: editTourneyDesc,
      status: editTourneyStatus,
    };

    fetch(`http://localhost:8080/api/v1/tournaments/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          showNotification(
            "success",
            json.message || "Cập nhật giải đấu thành công!",
          );
          fetchTournaments();
          setShowEditTourneyModal(false);
        } else {
          showNotification(
            "error",
            json.message || "Cập nhật giải đấu thất bại!",
          );
        }
      })
      .catch((err) => {
        console.error("Error updating tournament:", err);
        showNotification("error", "Lỗi kết nối máy chủ!");
      });
  };

  const selectedTourney = tournaments.find((t) => t.id === selectedId) || null;

  return (
    <div className="admin-container d-flex flex-column">

      {/* ── Mobile Header/Navbar ── */}
      <header className="mobile-admin-header d-flex d-lg-none justify-content-between align-items-center px-3 py-2 bg-white border-bottom w-100 position-fixed top-0 start-0 z-3">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn border-0 p-1 text-dark-navy"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Menu"
          >
            <i className="bi bi-list fs-3"></i>
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
        <div className="sidebar-brand-nav-group">
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

      {/* Overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col w-full overflow-hidden">
        {/* Header */}
        <header className="h-auto lg:h-20 bg-white border-b border-outline-variant px-md lg:px-xl py-4 lg:py-0 flex flex-col lg:flex-row items-center justify-between sticky top-0 z-30 gap-md">
          <div className="flex items-center justify-between w-full lg:hidden">
            <div className="flex items-center gap-2">
              <button
                className="cursor-pointer p-2 -ml-2 hover:bg-surface-container rounded-lg border-0 bg-transparent"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings:
                      "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  menu
                </span>
              </button>
              <span
                className="font-headline-sm text-primary"
                style={{ fontSize: "20px", fontWeight: 600 }}
              >
                HRTMS
              </span>
            </div>
            {currentSubView === "list" && (
              <button
                className="bg-primary text-white p-2 rounded-lg border-0"
                onClick={() => setCurrentSubView("create")}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings:
                      "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  add
                </span>
              </button>
            )}
          </div>
          <div className="flex-1 w-full max-w-2xl relative hidden lg:block"></div>
          {currentSubView === "list" && (
            <div className="hidden lg:flex items-center gap-lg ml-xl">
              <button
                className="bg-primary text-white px-lg py-2.5 rounded-lg font-bold flex items-center gap-sm shadow-md hover:bg-primary-container transition-all whitespace-nowrap border-0"
                onClick={() => setCurrentSubView("create")}
                style={{ cursor: "pointer" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings:
                      "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  add
                </span>
                CREATE NEW TOURNAMENT
              </button>
            </div>
          )}
        </header>

        {/* Dashboard Body */}
        <div className="p-4 lg:p-xl flex flex-col xl:flex-row gap-lg lg:gap-xl flex-1 overflow-auto">
          {currentSubView === "create" ? (
            /* Disabled Create Tournament Form */
            <div className="w-full">
              <div className="flex items-center justify-between mb-lg">
                <h2
                  className="text-headline-sm font-bold text-on-surface"
                  style={{ fontSize: "24px" }}
                >
                  Create New Tournament (Disabled)
                </h2>
                <button
                  className="bg-surface-container text-on-surface px-4 py-2 rounded-lg font-bold hover:bg-surface-variant transition-all border-0"
                  onClick={() => setCurrentSubView("list")}
                  style={{ cursor: "pointer" }}
                >
                  Back to List
                </button>
              </div>
              <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm opacity-60 pointer-events-none">
                <form>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      Tournament Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      disabled
                      placeholder="e.g. Royal Ascot 2024"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-md"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-md"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Allowed Breed
                      </label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        disabled
                      >
                        <option>Thoroughbred</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Age Requirement
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-md"
                        disabled
                        placeholder="3"
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

                {/* Data Table Container */}
                <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm flex-1">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead className="bg-surface-container-low border-b border-outline-variant">
                        <tr>
                          <th
                            className="p-md font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]"
                            style={{
                              padding: "1rem",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            Tournament Name
                          </th>
                          <th
                            className="p-md font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]"
                            style={{
                              padding: "1rem",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            Dates
                          </th>
                          <th
                            className="p-md font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]"
                            style={{
                              padding: "1rem",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            Races
                          </th>
                          <th
                            className="p-md font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]"
                            style={{
                              padding: "1rem",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            Status
                          </th>
                          <th className="p-md" style={{ padding: "1rem" }}></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        {tournaments.map((t) => (
                          <tr
                            key={t.id}
                            onClick={() => setSelectedId(t.id)}
                            className={`${selectedId === t.id ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-primary/5 group"} cursor-pointer transition-colors`}
                          >
                            <td className="p-md" style={{ padding: "1rem" }}>
                              <div className="flex flex-col">
                                <span
                                  className={`font-bold text-body-md ${selectedId === t.id ? "text-primary" : "text-on-surface group-hover:text-primary"}`}
                                  style={{ fontSize: "16px", fontWeight: 600 }}
                                >
                                  {t.name}
                                </span>
                                <span
                                  className={`text-[11px] font-mono ${selectedId === t.id ? "text-primary/70" : "text-outline"}`}
                                >
                                  {t.id}
                                </span>
                              </div>
                            </td>
                            <td
                              className={`p-md ${selectedId === t.id ? "text-on-surface" : "text-on-surface-variant"}`}
                              style={{ padding: "1rem" }}
                            >
                              {t.dates ||
                                (t.startDate && t.endDate
                                  ? `${new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })} - ${new Date(t.endDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}`
                                  : "N/A")}
                            </td>
                            <td
                              className={`p-md ${selectedId === t.id ? "text-on-surface" : "text-on-surface-variant"}`}
                              style={{ padding: "1rem" }}
                            >
                              {t.numRaces ?? t.raceCount ?? 0} Races
                            </td>
                            <td className="p-md" style={{ padding: "1rem" }}>
                              {t.status === "PUBLISHED" ||
                                t.status === "Published" ? (
                                <span className="px-2.5 py-1 bg-success/10 rounded-full text-[10px] font-bold text-success uppercase">
                                  Published
                                </span>
                              ) : t.status === "CANCELLED" ||
                                t.status === "Cancelled" ? (
                                <span className="px-2.5 py-1 bg-error-container rounded-full text-[10px] font-bold text-on-error-container uppercase">
                                  Cancelled
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold text-on-surface-variant uppercase">
                                  Draft
                                </span>
                              )}
                            </td>
                            <td
                              className="p-md text-right"
                              style={{ padding: "1rem" }}
                            >
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  className={`flex items-center gap-1 px-3 py-1 rounded border border-primary/30 text-primary text-[11px] font-bold transition-colors ${t.status?.toUpperCase() !== "DRAFT" ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/5"}`}
                                  disabled={t.status?.toUpperCase() !== "DRAFT"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (t.status?.toUpperCase() === "DRAFT")
                                      openEditTournamentModal(t);
                                  }}
                                  style={{
                                    cursor:
                                      t.status?.toUpperCase() !== "DRAFT"
                                        ? "not-allowed"
                                        : "pointer",
                                  }}
                                >
                                  <span
                                    className="material-symbols-outlined text-sm"
                                    style={{
                                      fontVariationSettings:
                                        "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                                      fontSize: "14px",
                                    }}
                                  >
                                    edit
                                  </span>
                                  UPDATE
                                </button>
                                <span
                                  className={`material-symbols-outlined ${selectedId === t.id ? "text-primary" : "text-outline group-hover:text-primary"}`}
                                  style={{
                                    fontVariationSettings:
                                      "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                                  }}
                                >
                                  chevron_right
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
            </>
          )}
          </div>
        </main>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant px-4 py-2 flex justify-between items-center z-40">
        <a
          className="flex flex-col items-center gap-1 text-primary no-underline"
          href="#"
          style={{ textDecoration: "none" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            military_tech
          </span>
          <span className="text-[10px] font-bold">Events</span>
        </a>
        <a
          className="flex flex-col items-center gap-1 text-on-surface-variant no-underline"
          href="#"
          style={{ textDecoration: "none" }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings:
                "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
            }}
          >
            fact_check
          </span>
          <span className="text-[10px] font-bold">Approvals</span>
        </a>
        <a
          className="flex flex-col items-center gap-1 text-on-surface-variant no-underline"
          href="#"
          style={{ textDecoration: "none" }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings:
                "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
            }}
          >
            verified_user
          </span>
          <span className="text-[10px] font-bold">Jockeys</span>
        </a>
        <a
          className="flex flex-col items-center gap-1 text-on-surface-variant no-underline"
          href="#"
          style={{ textDecoration: "none" }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings:
                "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
            }}
          >
            health_and_safety
          </span>
          <span className="text-[10px] font-bold">Health</span>
        </a>
      </div>

      {/* Modals */}

      {/* Add Race Modal */}
      {showAddRaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setShowAddRaceModal(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
            <div
              className="p-lg border-b border-outline-variant flex items-center justify-between"
              style={{ padding: "1.5rem" }}
            >
              <h3
                className="text-headline-sm font-bold text-on-surface"
                style={{ fontSize: "20px", margin: 0 }}
              >
                Add New Race
              </h3>
              <button
                className="p-2 hover:bg-surface-container rounded-full transition-colors border-0 bg-transparent"
                onClick={() => setShowAddRaceModal(false)}
                style={{ cursor: "pointer" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings:
                      "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  close
                </span>
              </button>
            </div>
            <form
              className="p-lg space-y-md"
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
              onSubmit={handleAddRace}
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Race Name
                </label>
                <input
                  required
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. Platinum Jubilee Stakes"
                  type="text"
                  value={newRaceName}
                  onChange={(e) => setNewRaceName(e.target.value)}
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                />
              </div>
              <div
                className="grid grid-cols-2 gap-md"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "1rem",
                }}
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                    Date
                  </label>
                  <input
                    required
                    className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    type="date"
                    value={newRaceDate}
                    onChange={(e) => setNewRaceDate(e.target.value)}
                    style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                    Laps
                  </label>
                  <input
                    required
                    className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    min="1"
                    placeholder="3"
                    type="number"
                    value={newRaceLaps}
                    onChange={(e) => setNewRaceLaps(e.target.value)}
                    style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                  />
                </div>
              </div>
              <div
                className="grid grid-cols-2 gap-md"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "1rem",
                }}
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                    Start Time
                  </label>
                  <input
                    required
                    className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    type="time"
                    value={newRaceStartTime}
                    onChange={(e) => setNewRaceStartTime(e.target.value)}
                    style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                    End Time
                  </label>
                  <input
                    required
                    className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    type="time"
                    value={newRaceEndTime}
                    onChange={(e) => setNewRaceEndTime(e.target.value)}
                    style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Number of Horses
                </label>
                <input
                  required
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  min="1"
                  placeholder="Enter number of horses"
                  type="number"
                  value={newRaceHorsesCount}
                  onChange={(e) => setNewRaceHorsesCount(e.target.value)}
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Referee
                </label>
                <select
                  required
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                  value={newRaceRefereeId}
                  onChange={(e) => setNewRaceRefereeId(e.target.value)}
                  disabled={
                    !newRaceDate ||
                    !newRaceStartTime ||
                    !newRaceEndTime ||
                    isFetchingReferees
                  }
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                >
                  <option value="">
                    {!newRaceDate || !newRaceStartTime || !newRaceEndTime
                      ? "Vui lòng chọn Ngày & Giờ trước"
                      : isFetchingReferees
                        ? "Đang tải danh sách..."
                        : availableReferees.length === 0
                          ? "Không có trọng tài nào rảnh"
                          : "Select Referee"}
                  </option>
                  {availableReferees.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-md" style={{ paddingTop: "1rem" }}>
                <button
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-md hover:bg-primary-container transition-all border-0"
                  type="submit"
                  style={{ cursor: "pointer" }}
                >
                  ADD NEW RACE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Race Modal */}
      {showEditRaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setShowEditRaceModal(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
            <div
              className="p-lg border-b border-outline-variant flex items-center justify-between"
              style={{ padding: "1.5rem" }}
            >
              <h3
                className="text-headline-sm font-bold text-on-surface"
                style={{ fontSize: "20px", margin: 0 }}
              >
                Edit Race Details
              </h3>
              <button
                className="p-2 hover:bg-surface-container rounded-full transition-colors border-0 bg-transparent"
                onClick={() => setShowEditRaceModal(false)}
                style={{ cursor: "pointer" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings:
                      "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  close
                </span>
              </button>
            </div>
            <form
              className="p-lg space-y-md"
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
              onSubmit={handleEditRace}
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Number of Laps
                </label>
                <input
                  required
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  min="1"
                  placeholder="3"
                  type="number"
                  value={editRaceLaps}
                  onChange={(e) => setEditRaceLaps(e.target.value)}
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Number of Horses
                </label>
                <input
                  required
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  min="1"
                  placeholder="Enter number of horses"
                  type="number"
                  value={editRaceHorsesCount}
                  onChange={(e) => setEditRaceHorsesCount(e.target.value)}
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Referee
                </label>
                <select
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                  value={editRaceRefereeId}
                  onChange={(e) => setEditRaceRefereeId(e.target.value)}
                  disabled={
                    !editingRace?.date ||
                    !editingRace?.startTime ||
                    !editingRace?.endTime ||
                    isFetchingEditReferees
                  }
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                >
                  <option value="">
                    {!editingRace?.date ||
                      !editingRace?.startTime ||
                      !editingRace?.endTime
                      ? "Cuộc đua chưa có đủ Ngày/Giờ"
                      : isFetchingEditReferees
                        ? "Đang tải danh sách..."
                        : editAvailableReferees.length === 0
                          ? "Không có trọng tài nào rảnh"
                          : "Select Referee"}
                  </option>
                  {editAvailableReferees.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                  {/* Fallback to show current referee if not in the list */}
                  {editRaceRefereeId &&
                    editRaceRefereeName &&
                    !editAvailableReferees.some(
                      (r) => r.id === editRaceRefereeId,
                    ) && (
                      <option value={editRaceRefereeId}>
                        {editRaceRefereeName}
                      </option>
                    )}
                </select>
              </div>
              <div
                className="pt-md flex gap-md"
                style={{ paddingTop: "1rem", display: "flex", gap: "1rem" }}
              >
                <button
                  className="flex-1 bg-surface-container text-on-surface py-3 rounded-lg font-bold hover:bg-surface-container-highest transition-all border-0"
                  onClick={() => setShowEditRaceModal(false)}
                  type="button"
                  style={{ cursor: "pointer" }}
                >
                  CANCEL
                </button>
                <button
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-bold shadow-md hover:bg-primary-container transition-all border-0"
                  type="submit"
                  style={{ cursor: "pointer" }}
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tournament Modal */}
      {showEditTourneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setShowEditTourneyModal(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
            <div
              className="p-lg border-b border-outline-variant flex items-center justify-between"
              style={{ padding: "1.5rem" }}
            >
              <h3
                className="text-headline-sm font-bold text-on-surface"
                style={{ fontSize: "20px", margin: 0 }}
              >
                Update Tournament
              </h3>
              <button
                className="p-2 hover:bg-surface-container rounded-full transition-colors border-0 bg-transparent"
                onClick={() => setShowEditTourneyModal(false)}
                style={{ cursor: "pointer" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings:
                      "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  close
                </span>
              </button>
            </div>
            <form
              className="p-lg space-y-md"
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
              onSubmit={handleUpdateTournament}
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Status
                </label>
                <select
                  required
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
                  value={editTourneyStatus}
                  onChange={(e) => setEditTourneyStatus(e.target.value)}
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Tournament Name
                </label>
                <input
                  required
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Enter tournament name"
                  type="text"
                  value={editTourneyName}
                  onChange={(e) => setEditTourneyName(e.target.value)}
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                />
              </div>
              <div
                className="grid grid-cols-2 gap-md"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "1rem",
                }}
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                    Start Date
                  </label>
                  <input
                    required
                    className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    type="date"
                    value={editTourneyStartDate}
                    onChange={(e) => setEditTourneyStartDate(e.target.value)}
                    style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                    End Date
                  </label>
                  <input
                    required
                    className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    type="date"
                    value={editTourneyEndDate}
                    onChange={(e) => setEditTourneyEndDate(e.target.value)}
                    style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Allowed Horse Breed
                </label>
                <input
                  required
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
                  type="text"
                  placeholder="e.g. Thoroughbred"
                  value={editTourneyBreed}
                  onChange={(e) => setEditTourneyBreed(e.target.value)}
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Horse Age Requirement (Years)
                </label>
                <input
                  required
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  min="0"
                  placeholder="e.g. 3"
                  type="number"
                  value={editTourneyAgeReq}
                  onChange={(e) => setEditTourneyAgeReq(e.target.value)}
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Tournament Description
                </label>
                <textarea
                  required
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  rows="3"
                  placeholder="Enter details about the tournament..."
                  value={editTourneyDesc}
                  onChange={(e) => setEditTourneyDesc(e.target.value)}
                  style={{ padding: "0.625rem 1rem", borderWidth: "1px" }}
                ></textarea>
              </div>
              <div
                className="pt-md flex gap-md"
                style={{ paddingTop: "1rem", display: "flex", gap: "1rem" }}
              >
                <button
                  className="flex-1 bg-surface-container text-on-surface py-3 rounded-lg font-bold hover:bg-surface-container-highest transition-all border-0"
                  onClick={() => setShowEditTourneyModal(false)}
                  type="button"
                  style={{ cursor: "pointer" }}
                >
                  CANCEL
                </button>
                <button
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-bold shadow-md hover:bg-primary-container transition-all border-0"
                  type="submit"
                  style={{ cursor: "pointer" }}
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl text-sm font-bold border transition-all ${notification.type === "error"
              ? "bg-red-100 text-red-800 border-red-200"
              : "bg-green-100 text-green-800 border-green-200"
            }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
