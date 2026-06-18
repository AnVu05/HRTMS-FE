import { useState, useEffect } from "react";
import "../styles/AdminDashboard.css"; // Kept just in case there are global overrides



export default function AdminDashboard({ onNavigate }) {
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [tournamentRaces, setTournamentRaces] = useState([]);
  const [tournamentDetails, setTournamentDetails] = useState(null);

  // Notification State
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Modals
  const [showAddRaceModal, setShowAddRaceModal] = useState(false);
  const [showEditRaceModal, setShowEditRaceModal] = useState(false);
  const [showEditTourneyModal, setShowEditTourneyModal] = useState(false);

  // Subviews (for "Create Tournament" disabled form)
  const [currentSubView, setCurrentSubView] = useState("list");

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

  // Edit Race State
  const [editingRaceId, setEditingRaceId] = useState("");
  const [editRaceLaps, setEditRaceLaps] = useState(3);
  const [editRaceHorsesCount, setEditRaceHorsesCount] = useState(8);
  const [editRaceRefereeId, setEditRaceRefereeId] = useState("");
  const [editRaceRefereeName, setEditRaceRefereeName] = useState("");

  // Available Referees State (Add)
  const [availableReferees, setAvailableReferees] = useState([]);
  const [isFetchingReferees, setIsFetchingReferees] = useState(false);

  // Available Referees State (Edit)
  const [editingRace, setEditingRace] = useState(null);
  const [editAvailableReferees, setEditAvailableReferees] = useState([]);
  const [isFetchingEditReferees, setIsFetchingEditReferees] = useState(false);

  // Edit Tournament State
  const [editTourneyName, setEditTourneyName] = useState("");
  const [editTourneyStartDate, setEditTourneyStartDate] = useState("");
  const [editTourneyEndDate, setEditTourneyEndDate] = useState("");
  const [editTourneyBreed, setEditTourneyBreed] = useState("Thoroughbred");
  const [editTourneyAgeReq, setEditTourneyAgeReq] = useState(3);
  const [editTourneyDesc, setEditTourneyDesc] = useState("");
  const [editTourneyStatus, setEditTourneyStatus] = useState("DRAFT");

  // Fetch Dashboard
  const fetchTournaments = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/tournaments/dashboard");
      const json = await res.json();
      if (json.data) {
        setTournaments(json.data);
        if (json.data.length > 0 && !selectedId) {
          setSelectedId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tournaments:", err);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Fetch Available Referees when Date, Start Time and End Time change
  useEffect(() => {
    if (newRaceDate && newRaceStartTime && newRaceEndTime) {
      const fetchReferees = async () => {
        setIsFetchingReferees(true);
        try {
          const res = await fetch(`http://localhost:8080/api/v1/referees?date=${newRaceDate}&startTime=${newRaceStartTime}&endTime=${newRaceEndTime}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
              setAvailableReferees(json.data);
            } else {
              setAvailableReferees([]);
            }
          } else {
            setAvailableReferees([]);
          }
        } catch (error) {
          console.error("Failed to fetch available referees:", error);
          setAvailableReferees([]);
        } finally {
          setIsFetchingReferees(false);
        }
      };
      
      // We can use a short timeout to debounce if needed, but for now we call it directly
      const delayDebounceFn = setTimeout(() => {
        fetchReferees();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setAvailableReferees([]);
    }
  }, [newRaceDate, newRaceStartTime, newRaceEndTime]);

  // Fetch Available Referees for Edit Race
  useEffect(() => {
    if (showEditRaceModal && editingRace && editingRace.date && editingRace.startTime && editingRace.endTime) {
      const fetchReferees = async () => {
        setIsFetchingEditReferees(true);
        try {
          const res = await fetch(`http://localhost:8080/api/v1/referees?date=${editingRace.date}&startTime=${editingRace.startTime}&endTime=${editingRace.endTime}&excludeRaceId=${editingRace.id}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
              setEditAvailableReferees(json.data);
            } else {
              setEditAvailableReferees([]);
            }
          } else {
            setEditAvailableReferees([]);
          }
        } catch (error) {
          console.error("Failed to fetch available referees:", error);
          setEditAvailableReferees([]);
        } finally {
          setIsFetchingEditReferees(false);
        }
      };
      
      const delayDebounceFn = setTimeout(() => {
        fetchReferees();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setEditAvailableReferees([]);
    }
  }, [showEditRaceModal, editingRace]);

  // Fetch Races for Tournament
  const fetchRaces = (id) => {
    fetch(`http://localhost:8080/api/v1/races/tournament/${id}`)
      .then((res) => res.json())
      .then((resData) => {
        setTournamentDetails(resData.data);
        let list = [];
        if (Array.isArray(resData.data)) {
          list = resData.data;
        } else if (resData.data && Array.isArray(resData.data.races)) {
          list = resData.data.races;
        } else if (resData.data && Array.isArray(resData.data.content)) {
          list = resData.data.content;
        } else if (resData.data && typeof resData.data === "object") {
          list = [resData.data];
        }
        setTournamentRaces(list);
      })
      .catch((err) => console.error("Error fetching races:", err));
  };

  useEffect(() => {
    if (selectedId) {
      fetchRaces(selectedId);
    } else {
      setTournamentRaces([]);
      setTournamentDetails(null);
    }
  }, [selectedId]);

  // Handlers
  const handleAddRace = (e) => {
    e.preventDefault();
    if (!selectedId) return;

    const payload = {
      tournament_id: Number(selectedId),
      race_name: newRaceName,
      date: newRaceDate,
      start_time: newRaceStartTime.length === 5 ? `${newRaceStartTime}:00` : newRaceStartTime,
      end_time: newRaceEndTime.length === 5 ? `${newRaceEndTime}:00` : newRaceEndTime,
      laps: Number(newRaceLaps),
      num_horse: Number(newRaceHorsesCount),
      referee_id: newRaceRefereeId ? Number(newRaceRefereeId) : null
    };

    fetch("http://localhost:8080/api/v1/races", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          showNotification("success", json.message || "Thêm mới cuộc đua thành công!");
          fetchRaces(selectedId);
          setShowAddRaceModal(false);
          setNewRaceName("");
          setNewRaceDate("");
          setNewRaceStartTime("");
          setNewRaceEndTime("");
          setNewRaceLaps(3);
          setNewRaceHorsesCount(8);
          setNewRaceRefereeId("");
        } else {
          showNotification("error", json.message || "Tạo cuộc đua thất bại!");
        }
      })
      .catch(err => {
        console.error("Error creating race:", err);
        showNotification("error", "Lỗi kết nối máy chủ!");
      });
  };

  const openEditRaceModal = (race) => {
    setEditingRaceId(race.id);
    setEditingRace(race);
    setEditRaceLaps(race.laps || 3);
    setEditRaceHorsesCount(race.numHorse || race.horsesCount || 8);
    setEditRaceRefereeId(race.refereeId || "");
    setEditRaceRefereeName(race.refereeName || "");
    setShowEditRaceModal(true);
  };

  const handleEditRace = (e) => {
    e.preventDefault();
    if (!editingRaceId) return;

    const payload = {
      laps: Number(editRaceLaps),
      num_horse: Number(editRaceHorsesCount),
      referee_id: Number(editRaceRefereeId)
    };

    fetch(`http://localhost:8080/api/v1/races/${editingRaceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          showNotification("success", json.message || "Cập nhật cuộc đua thành công!");
          fetchRaces(selectedId);
          setShowEditRaceModal(false);
        } else {
          showNotification("error", json.message || "Cập nhật cuộc đua thất bại!");
        }
      })
      .catch(err => {
        console.error("Error updating race:", err);
        showNotification("error", "Lỗi kết nối máy chủ!");
      });
  };

  const openEditTournamentModal = (t) => {
    setEditTourneyName(t.name || "");
    setEditTourneyStartDate(t.startDate || "");
    setEditTourneyEndDate(t.endDate || "");
    setEditTourneyBreed(t.allowedBreed || "Thoroughbred");
    setEditTourneyAgeReq(t.allowedHorseAge || t.ageRequirement || 3);
    setEditTourneyDesc(t.description || "");
    setEditTourneyStatus(t.status || "DRAFT");
    setShowEditTourneyModal(true);
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
      status: editTourneyStatus
    };

    fetch(`http://localhost:8080/api/v1/tournaments/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          showNotification("success", json.message || "Cập nhật giải đấu thành công!");
          fetchTournaments();
          setShowEditTourneyModal(false);
        } else {
          showNotification("error", json.message || "Cập nhật giải đấu thất bại!");
        }
      })
      .catch(err => {
        console.error("Error updating tournament:", err);
        showNotification("error", "Lỗi kết nối máy chủ!");
      });
  };

  const selectedTourney = tournaments.find((t) => t.id === selectedId) || null;

  return (
    <div className="bg-surface-container font-body-sm text-on-surface antialiased flex flex-col lg:flex-row min-h-screen" style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}>
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-outline-variant flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-lg flex items-center justify-between lg:justify-start gap-sm">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>military_tech</span>
            <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight" style={{ fontSize: '20px', fontWeight: 600 }}>HRTMS Admin</h1>
          </div>
          <button className="lg:hidden cursor-pointer p-2 hover:bg-surface-container rounded-lg" onClick={() => setMobileMenuOpen(false)}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>close</span>
          </button>
        </div>
        <nav className="flex-1 px-md space-y-1 py-md">
          <a className={`flex items-center gap-md px-md py-3 rounded-xl font-semibold transition-all group no-underline ${activeMenu === 'Tournaments' ? 'active-nav' : 'text-on-surface-variant hover:bg-surface-container'}`} onClick={() => { setActiveMenu("Tournaments"); setCurrentSubView("list"); setMobileMenuOpen(false); }} style={{ cursor: 'pointer', textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            <span>Tournaments</span>
          </a>
          <a className="flex items-center gap-md px-md py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-all group no-underline" href="#" style={{ textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>fact_check</span>
            <span>Approve Application</span>
          </a>
          <a className="flex items-center gap-md px-md py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-all group no-underline" href="#" style={{ textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>verified_user</span>
            <span>Verify Profile Jockey</span>
          </a>
          <a className="flex items-center gap-md px-md py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-all group no-underline" href="#" style={{ textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>health_and_safety</span>
            <span>Healthcheck Management</span>
          </a>
          <a className="flex items-center gap-md px-md py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-all group no-underline" href="#" style={{ textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>report_problem</span>
            <span>Incident Management</span>
          </a>
          <a className="flex items-center gap-md px-md py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-all group no-underline" href="#" style={{ textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>notifications</span>
            <span>Notification</span>
          </a>
        </nav>
        <div className="p-md mt-auto border-t border-outline-variant">
          <button className="w-full flex items-center gap-md px-md py-3 text-error hover:bg-error-container/20 rounded-xl transition-all" onClick={() => onNavigate && onNavigate("login")}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>logout</span>
            <span className="font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-on-surface/40 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col w-full overflow-hidden">
        {/* Header */}
        <header className="h-auto lg:h-20 bg-white border-b border-outline-variant px-md lg:px-xl py-4 lg:py-0 flex flex-col lg:flex-row items-center justify-between sticky top-0 z-30 gap-md">
          <div className="flex items-center justify-between w-full lg:hidden">
            <div className="flex items-center gap-2">
              <button className="cursor-pointer p-2 -ml-2 hover:bg-surface-container rounded-lg border-0 bg-transparent" onClick={() => setMobileMenuOpen(true)}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>menu</span>
              </button>
              <span className="font-headline-sm text-primary" style={{ fontSize: '20px', fontWeight: 600 }}>HRTMS</span>
            </div>
            {currentSubView === 'list' && (
              <button className="bg-primary text-white p-2 rounded-lg border-0" onClick={() => setCurrentSubView('create')}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>add</span>
              </button>
            )}
          </div>
          <div className="flex-1 w-full max-w-2xl relative hidden lg:block"></div>
          {currentSubView === 'list' && (
            <div className="hidden lg:flex items-center gap-lg ml-xl">
              <button className="bg-primary text-white px-lg py-2.5 rounded-lg font-bold flex items-center gap-sm shadow-md hover:bg-primary-container transition-all whitespace-nowrap border-0" onClick={() => setCurrentSubView('create')} style={{ cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>add</span>
                CREATE NEW TOURNAMENT
              </button>
            </div>
          )}
        </header>

        {/* Dashboard Body */}
        <div className="p-4 lg:p-xl flex flex-col xl:flex-row gap-lg lg:gap-xl flex-1 overflow-auto">
          {currentSubView === 'create' ? (
            /* Disabled Create Tournament Form */
            <div className="w-full">
              <div className="flex items-center justify-between mb-lg">
                <h2 className="text-headline-sm font-bold text-on-surface" style={{ fontSize: '24px' }}>Create New Tournament (Disabled)</h2>
                <button className="bg-surface-container text-on-surface px-4 py-2 rounded-lg font-bold hover:bg-surface-variant transition-all border-0" onClick={() => setCurrentSubView('list')} style={{ cursor: 'pointer' }}>Back to List</button>
              </div>
              <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm opacity-60 pointer-events-none">
                <form>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Tournament Name</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-md" disabled placeholder="e.g. Royal Ascot 2024" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Start Date</label>
                      <input type="date" className="w-full px-3 py-2 border rounded-md" disabled />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">End Date</label>
                      <input type="date" className="w-full px-3 py-2 border rounded-md" disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Allowed Breed</label>
                      <select className="w-full px-3 py-2 border rounded-md" disabled>
                        <option>Thoroughbred</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Age Requirement</label>
                      <input type="number" className="w-full px-3 py-2 border rounded-md" disabled placeholder="3" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Description</label>
                    <textarea className="w-full px-3 py-2 border rounded-md" disabled rows="3" placeholder="Description..."></textarea>
                  </div>
                  <button type="button" className="bg-primary text-white px-4 py-2 rounded-md font-bold w-full mt-4" disabled>SAVE TOURNAMENT</button>
                </form>
              </div>
            </div>
          ) : (
            /* Tournaments List and Race Details */
            <>
              {/* Left Pane: Tournament List */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-lg gap-2" style={{ marginBottom: '1.5rem' }}>
                  <h2 className="text-headline-sm font-bold text-on-surface" style={{ fontSize: '24px' }}>Tournaments</h2>
                  <div className="flex items-center gap-4">
                    <p className="text-on-surface-variant text-sm" style={{ margin: 0 }}>Showing {tournaments.length} active tournaments</p>
                  </div>
                </div>

                {/* Data Table Container */}
                <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm flex-1">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead className="bg-surface-container-low border-b border-outline-variant">
                        <tr>
                          <th className="p-md font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]" style={{ padding: '1rem', fontSize: '11px', fontWeight: 700 }}>Tournament Name</th>
                          <th className="p-md font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]" style={{ padding: '1rem', fontSize: '11px', fontWeight: 700 }}>Dates</th>
                          <th className="p-md font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]" style={{ padding: '1rem', fontSize: '11px', fontWeight: 700 }}>Races</th>
                          <th className="p-md font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]" style={{ padding: '1rem', fontSize: '11px', fontWeight: 700 }}>Status</th>
                          <th className="p-md" style={{ padding: '1rem' }}></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        {tournaments.map((t) => (
                          <tr key={t.id} onClick={() => setSelectedId(t.id)} className={`${selectedId === t.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-primary/5 group'} cursor-pointer transition-colors`}>
                            <td className="p-md" style={{ padding: '1rem' }}>
                              <div className="flex flex-col">
                                <span className={`font-bold text-body-md ${selectedId === t.id ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`} style={{ fontSize: '16px', fontWeight: 600 }}>{t.name}</span>
                                <span className={`text-[11px] font-mono ${selectedId === t.id ? 'text-primary/70' : 'text-outline'}`}>{t.id}</span>
                              </div>
                            </td>
                            <td className={`p-md ${selectedId === t.id ? 'text-on-surface' : 'text-on-surface-variant'}`} style={{ padding: '1rem' }}>
                              {t.dates || (t.startDate && t.endDate ? `${new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })} - ${new Date(t.endDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}` : "N/A")}
                            </td>
                            <td className={`p-md ${selectedId === t.id ? 'text-on-surface' : 'text-on-surface-variant'}`} style={{ padding: '1rem' }}>
                              {t.numRaces ?? t.raceCount ?? 0} Races
                            </td>
                            <td className="p-md" style={{ padding: '1rem' }}>
                              {t.status === 'PUBLISHED' || t.status === 'Published' ? (
                                <span className="px-2.5 py-1 bg-success/10 rounded-full text-[10px] font-bold text-success uppercase">Published</span>
                              ) : t.status === 'CANCELLED' || t.status === 'Cancelled' ? (
                                <span className="px-2.5 py-1 bg-error-container rounded-full text-[10px] font-bold text-on-error-container uppercase">Cancelled</span>
                              ) : (
                                <span className="px-2.5 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold text-on-surface-variant uppercase">Draft</span>
                              )}
                            </td>
                            <td className="p-md text-right" style={{ padding: '1rem' }}>
                              <div className="flex items-center justify-end gap-2">
                                <button className={`flex items-center gap-1 px-3 py-1 rounded border border-primary/30 text-primary text-[11px] font-bold transition-colors ${t.status?.toUpperCase() !== 'DRAFT' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/5'}`} disabled={t.status?.toUpperCase() !== 'DRAFT'} onClick={(e) => { e.stopPropagation(); if (t.status?.toUpperCase() === 'DRAFT') openEditTournamentModal(t); }} style={{ cursor: t.status?.toUpperCase() !== 'DRAFT' ? 'not-allowed' : 'pointer' }}>
                                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: '14px' }}>edit</span>
                                  UPDATE
                                </button>
                                <span className={`material-symbols-outlined ${selectedId === t.id ? 'text-primary' : 'text-outline group-hover:text-primary'}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_right</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Pane: Details View (Race Schedule) */}
              <div className="w-full xl:w-[400px] flex flex-col gap-lg">
                {selectedTourney ? (
                  <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-lg bg-surface-container-low border-b border-outline-variant" style={{ padding: '1.5rem' }}>
                      <div className="flex items-center justify-between mb-md" style={{ marginBottom: '1rem' }}>
                        <h3 className="font-headline-sm text-on-surface" style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Tournament Details</h3>
                      </div>
                      <div className="space-y-md" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant text-xs" style={{ fontSize: '12px' }}>STATUS</span>
                          {selectedTourney.status === 'PUBLISHED' || selectedTourney.status === 'Published' ? (
                            <span className="text-success font-bold text-xs uppercase" style={{ fontSize: '12px' }}>Published</span>
                          ) : selectedTourney.status === 'CANCELLED' || selectedTourney.status === 'Cancelled' ? (
                            <span className="text-error font-bold text-xs uppercase" style={{ fontSize: '12px' }}>Cancelled</span>
                          ) : (
                            <span className="text-on-surface font-bold text-xs uppercase" style={{ fontSize: '12px' }}>Draft</span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant text-xs" style={{ fontSize: '12px' }}>TOTAL ENTRIES</span>
                          <span className="text-on-surface font-bold text-xs" style={{ fontSize: '12px' }}>{tournamentDetails?.totalEntries ?? selectedTourney?.totalEntries ?? "0"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-lg space-y-md" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
                      <div className="flex items-center justify-between mb-md">
                        <h4 className="font-label-caps text-on-surface-variant text-[11px] tracking-widest uppercase" style={{ fontSize: '11px', fontWeight: 700, margin: 0 }}>Race Schedule ({tournamentRaces.length})</h4>
                        <button className="flex items-center gap-1 text-primary text-xs font-bold hover:bg-primary/5 px-2 py-1 rounded transition-colors border-0 bg-transparent" onClick={() => setShowAddRaceModal(true)} style={{ cursor: 'pointer' }}>
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: '14px' }}>add</span>
                          Add new races
                        </button>
                      </div>
                      <div className="space-y-sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {tournamentRaces.map((race, index) => (
                          <div key={race.id || index} className="p-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50 transition-all cursor-pointer group" style={{ padding: '1rem', borderRadius: '0.75rem', borderWidth: '1px' }}>
                            <div className="flex items-center justify-between mb-xs" style={{ marginBottom: '0.5rem' }}>
                              <span className="font-bold text-on-surface group-hover:text-primary" style={{ fontWeight: 600 }}>{race.name || race.raceName || "Unnamed Race"}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-primary/5 text-primary rounded font-bold">{race.code || `RACE ${index + 1}`}</span>
                              {(race.status === 'PUBLISHED' || race.status === 'Published') && <span className="px-2 py-0.5 bg-success/10 text-success rounded text-[10px] font-bold uppercase ml-2">published</span>}
                              {(race.status === 'CANCELLED' || race.status === 'Cancelled') && <span className="px-2 py-0.5 bg-error-container text-on-error-container rounded text-[10px] font-bold uppercase ml-2">cancelled</span>}
                              {(race.status === 'PENDING_REFEREE' || race.status === 'Pending_Referee') && <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-bold uppercase ml-2">pending_referee</span>}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] text-on-surface-variant" style={{ margin: 0 }}>{(race.startTime && race.endTime) ? `${race.startTime} - ${race.endTime}` : (race.time || "TBD")} • {race.laps || 0} Laps</p>
                              <button className="flex items-center gap-1 px-3 py-1 rounded border border-primary/30 text-primary text-[11px] font-bold hover:bg-primary/5 transition-colors bg-transparent" onClick={() => openEditRaceModal(race)} style={{ cursor: 'pointer' }}>
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: '14px' }}>edit</span>
                                UPDATE
                              </button>
                            </div>
                          </div>
                        ))}
                        {tournamentRaces.length === 0 && (
                          <div className="text-center py-5 text-muted border border-dashed rounded-3 mt-4" style={{ padding: '2rem 0', color: '#64748b' }}>
                            <span>No races scheduled yet</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm rounded-xl bg-white h-full p-4 d-flex align-items-center justify-content-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span className="text-muted text-on-surface-variant">Select a tournament to view details...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant px-4 py-2 flex justify-between items-center z-40">
        <a className="flex flex-col items-center gap-1 text-primary no-underline" href="#" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="text-[10px] font-bold">Events</span>
        </a>
        <a className="flex flex-col items-center gap-1 text-on-surface-variant no-underline" href="#" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>fact_check</span>
          <span className="text-[10px] font-bold">Approvals</span>
        </a>
        <a className="flex flex-col items-center gap-1 text-on-surface-variant no-underline" href="#" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>verified_user</span>
          <span className="text-[10px] font-bold">Jockeys</span>
        </a>
        <a className="flex flex-col items-center gap-1 text-on-surface-variant no-underline" href="#" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>health_and_safety</span>
          <span className="text-[10px] font-bold">Health</span>
        </a>
      </div>

      {/* Modals */}

      {/* Add Race Modal */}
      {showAddRaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setShowAddRaceModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between" style={{ padding: '1.5rem' }}>
              <h3 className="text-headline-sm font-bold text-on-surface" style={{ fontSize: '20px', margin: 0 }}>Add New Race</h3>
              <button className="p-2 hover:bg-surface-container rounded-full transition-colors border-0 bg-transparent" onClick={() => setShowAddRaceModal(false)} style={{ cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>close</span>
              </button>
            </div>
            <form className="p-lg space-y-md" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleAddRace}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Race Name</label>
                <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. Platinum Jubilee Stakes" type="text" value={newRaceName} onChange={(e) => setNewRaceName(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
              </div>
              <div className="grid grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Date</label>
                  <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="date" value={newRaceDate} onChange={(e) => setNewRaceDate(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Laps</label>
                  <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" min="1" placeholder="3" type="number" value={newRaceLaps} onChange={(e) => setNewRaceLaps(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Start Time</label>
                  <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="time" value={newRaceStartTime} onChange={(e) => setNewRaceStartTime(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">End Time</label>
                  <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="time" value={newRaceEndTime} onChange={(e) => setNewRaceEndTime(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Number of Horses</label>
                <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" min="1" placeholder="Enter number of horses" type="number" value={newRaceHorsesCount} onChange={(e) => setNewRaceHorsesCount(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Referee</label>
                <select 
                  required 
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white disabled:opacity-60 disabled:cursor-not-allowed" 
                  value={newRaceRefereeId} 
                  onChange={(e) => setNewRaceRefereeId(e.target.value)} 
                  disabled={!newRaceDate || !newRaceStartTime || !newRaceEndTime || isFetchingReferees}
                  style={{ padding: '0.625rem 1rem', borderWidth: '1px' }}
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
                  {availableReferees.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-md" style={{ paddingTop: '1rem' }}>
                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-md hover:bg-primary-container transition-all border-0" type="submit" style={{ cursor: 'pointer' }}>
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
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setShowEditRaceModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between" style={{ padding: '1.5rem' }}>
              <h3 className="text-headline-sm font-bold text-on-surface" style={{ fontSize: '20px', margin: 0 }}>Edit Race Details</h3>
              <button className="p-2 hover:bg-surface-container rounded-full transition-colors border-0 bg-transparent" onClick={() => setShowEditRaceModal(false)} style={{ cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>close</span>
              </button>
            </div>
            <form className="p-lg space-y-md" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleEditRace}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Number of Laps</label>
                <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" min="1" placeholder="3" type="number" value={editRaceLaps} onChange={(e) => setEditRaceLaps(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Number of Horses</label>
                <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" min="1" placeholder="Enter number of horses" type="number" value={editRaceHorsesCount} onChange={(e) => setEditRaceHorsesCount(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Referee</label>
                <select 
                  className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white disabled:opacity-60 disabled:cursor-not-allowed" 
                  value={editRaceRefereeId} 
                  onChange={(e) => setEditRaceRefereeId(e.target.value)} 
                  disabled={!editingRace?.date || !editingRace?.startTime || !editingRace?.endTime || isFetchingEditReferees}
                  style={{ padding: '0.625rem 1rem', borderWidth: '1px' }}
                >
                  <option value="">
                    {!editingRace?.date || !editingRace?.startTime || !editingRace?.endTime 
                      ? "Cuộc đua chưa có đủ Ngày/Giờ" 
                      : isFetchingEditReferees 
                        ? "Đang tải danh sách..." 
                        : editAvailableReferees.length === 0 
                          ? "Không có trọng tài nào rảnh" 
                          : "Select Referee"}
                  </option>
                  {editAvailableReferees.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                  {/* Fallback to show current referee if not in the list */}
                  {editRaceRefereeId && editRaceRefereeName && !editAvailableReferees.some(r => r.id === editRaceRefereeId) && (
                    <option value={editRaceRefereeId}>{editRaceRefereeName}</option>
                  )}
                </select>
              </div>
              <div className="pt-md flex gap-md" style={{ paddingTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button className="flex-1 bg-surface-container text-on-surface py-3 rounded-lg font-bold hover:bg-surface-container-highest transition-all border-0" onClick={() => setShowEditRaceModal(false)} type="button" style={{ cursor: 'pointer' }}>CANCEL</button>
                <button className="flex-1 bg-primary text-white py-3 rounded-lg font-bold shadow-md hover:bg-primary-container transition-all border-0" type="submit" style={{ cursor: 'pointer' }}>SAVE CHANGES</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tournament Modal */}
      {showEditTourneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setShowEditTourneyModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between" style={{ padding: '1.5rem' }}>
              <h3 className="text-headline-sm font-bold text-on-surface" style={{ fontSize: '20px', margin: 0 }}>Update Tournament</h3>
              <button className="p-2 hover:bg-surface-container rounded-full transition-colors border-0 bg-transparent" onClick={() => setShowEditTourneyModal(false)} style={{ cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>close</span>
              </button>
            </div>
            <form className="p-lg space-y-md" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleUpdateTournament}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Status</label>
                <select required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white" value={editTourneyStatus} onChange={(e) => setEditTourneyStatus(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Tournament Name</label>
                <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Enter tournament name" type="text" value={editTourneyName} onChange={(e) => setEditTourneyName(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
              </div>
              <div className="grid grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Start Date</label>
                  <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="date" value={editTourneyStartDate} onChange={(e) => setEditTourneyStartDate(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">End Date</label>
                  <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="date" value={editTourneyEndDate} onChange={(e) => setEditTourneyEndDate(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Allowed Horse Breed</label>
                <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white" type="text" placeholder="e.g. Thoroughbred" value={editTourneyBreed} onChange={(e) => setEditTourneyBreed(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Horse Age Requirement (Years)</label>
                <input required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" min="0" placeholder="e.g. 3" type="number" value={editTourneyAgeReq} onChange={(e) => setEditTourneyAgeReq(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Tournament Description</label>
                <textarea required className="w-full px-md py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" rows="3" placeholder="Enter details about the tournament..." value={editTourneyDesc} onChange={(e) => setEditTourneyDesc(e.target.value)} style={{ padding: '0.625rem 1rem', borderWidth: '1px' }}></textarea>
              </div>
              <div className="pt-md flex gap-md" style={{ paddingTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button className="flex-1 bg-surface-container text-on-surface py-3 rounded-lg font-bold hover:bg-surface-container-highest transition-all border-0" onClick={() => setShowEditTourneyModal(false)} type="button" style={{ cursor: 'pointer' }}>CANCEL</button>
                <button className="flex-1 bg-primary text-white py-3 rounded-lg font-bold shadow-md hover:bg-primary-container transition-all border-0" type="submit" style={{ cursor: 'pointer' }}>SAVE CHANGES</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl text-sm font-bold border transition-all ${
          notification.type === 'error' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
