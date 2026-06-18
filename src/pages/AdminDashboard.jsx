import { useState, useEffect } from "react";
import "../styles/AdminDashboard.css";

// ─── Initial Mock Data ────────────────────────────────────────────────────────
// Data is now fetched via API

const MOCK_HORSES = [
  "Lightning Strike",
  "Midnight Runner",
  "Golden Gallop",
  "Silver Swift",
  "Bronze Bullet",
  "Stormy Sea",
  "Blazing Star",
  "Shadow Dancer",
  "Wind Whisperer",
  "Eclipse Rider",
];

const MOCK_REFEREES = [
  "John Doe (Ref)",
  "Jane Smith (Ref)",
  "Alice Johnson (Ref)",
  "Bob Brown (Ref)",
  "Charlie Davis (Ref)",
];

export default function AdminDashboard({ onNavigate }) {
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [tournamentRaces, setTournamentRaces] = useState([]);
  const [tournamentDetails, setTournamentDetails] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Tournaments");

  // Modal / Form States
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showRaceModal, setShowRaceModal] = useState(false);

  // New Tournament Input State
  const [newTourneyName, setNewTourneyName] = useState("");
  const [newTourneyDates, setNewTourneyDates] = useState("");

  // New Race Input State
  const [newRaceName, setNewRaceName] = useState("");
  const [newRaceDate, setNewRaceDate] = useState("");
  const [newRaceLaps, setNewRaceLaps] = useState(3);
  const [newRaceStartTime, setNewRaceStartTime] = useState("");
  const [newRaceEndTime, setNewRaceEndTime] = useState("");
  const [newRaceHorse, setNewRaceHorse] = useState("");
  const [newRaceReferee, setNewRaceReferee] = useState("");

  const selectedTourney = tournaments.find((t) => t.id === selectedId) || null;

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/tournaments/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        const list = resData.data || [];
        setTournaments(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      })
      .catch((err) => console.error("Error fetching tournaments:", err));
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetch(`http://localhost:8080/api/v1/races/tournament/${selectedId}`)
        .then((res) => res.json())
        .then((resData) => {
          console.log("Races API response:", resData);
          setTournamentDetails(resData.data); // Store the full data object
          let list = [];
          if (Array.isArray(resData.data)) {
            list = resData.data;
          } else if (resData.data && Array.isArray(resData.data.races)) {
            list = resData.data.races;
          } else if (resData.data && Array.isArray(resData.data.content)) {
            list = resData.data.content;
          } else if (resData.data && typeof resData.data === "object") {
            // fallback if it's just a single object returned instead of list
            list = [resData.data];
          }
          setTournamentRaces(list);
        })
        .catch((err) => console.error("Error fetching races:", err));
    } else {
      setTournamentRaces([]);
      setTournamentDetails(null);
    }
  }, [selectedId]);

  const handleCreateTournament = (e) => {
    e.preventDefault();
    if (!newTourneyName || !newTourneyDates) return;

    const newId = `TRN-2024-${String(tournaments.length + 8).padStart(2, "0")}`;
    const newTourney = {
      id: newId,
      name: newTourneyName,
      dates: newTourneyDates,
      raceCount: 0,
      status: "DRAFT",
      totalEntries: "0 Horses",
    };

    setTournaments([...tournaments, newTourney]);
    setSelectedId(newId);
    setNewTourneyName("");
    setNewTourneyDates("");
    setShowTournamentModal(false);
  };

  const handleAddRace = (e) => {
    e.preventDefault();
    if (!newRaceName || !newRaceStartTime || !newRaceEndTime) return;

    const formattedTime = `${newRaceStartTime} - ${newRaceEndTime}`;

    const updatedTourneys = tournaments.map((t) => {
      if (t.id === selectedId) {
        return {
          ...t,
          raceCount: t.raceCount + 1,
        };
      }
      return t;
    });

    const nextRaceNum = tournamentRaces.length + 1;
    const newRace = {
      id: nextRaceNum,
      name: newRaceName,
      code: `RACE ${nextRaceNum}`,
      status: "PUBLISHED",
      date: newRaceDate,
      startTime: newRaceStartTime,
      endTime: newRaceEndTime,
      time: formattedTime,
      laps: parseInt(newRaceLaps, 10) || 3,
    };

    setTournaments(updatedTourneys);
    setTournamentRaces([...tournamentRaces, newRace]);
    setNewRaceName("");
    setNewRaceDate("");
    setNewRaceLaps(3);
    setNewRaceStartTime("");
    setNewRaceEndTime("");
    setNewRaceHorse("");
    setNewRaceReferee("");
    setShowRaceModal(false);
  };

  const menuItems = [
    { name: "Tournaments", icon: "bi-trophy" },
    { name: "Approve Application", icon: "bi-file-earmark-check" },
    { name: "Verify Profile Jockey", icon: "bi-shield-check" },
    { name: "Healthcheck Management", icon: "bi-activity" },
    { name: "Incident Management", icon: "bi-exclamation-triangle" },
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
            <i className="bi bi-award-fill"></i> HRTMS Admin
          </span>
        </div>
        <button
          className="btn btn-primary btn-sm px-3 py-2 fw-bold"
          onClick={() => setShowTournamentModal(true)}
          style={{ fontSize: "12px", borderRadius: "6px" }}
        >
          + CREATE
        </button>
      </header>

      {/* ── Left Sidebar ── */}
      <aside
        className={`admin-sidebar bg-white border-end d-flex flex-column justify-content-between ${sidebarOpen ? "open" : ""}`}
      >
        <div>
          {/* Logo Section */}
          <div className="sidebar-logo d-flex align-items-center gap-2 p-4 border-bottom">
            <i className="bi bi-award-fill fs-4 text-primary-custom"></i>
            <span className="brand-title fw-bold text-dark-navy m-0">
              HRTMS Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav p-3">
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <button
                    className={`w-100 sidebar-link border-0 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-semibold ${activeMenu === item.name ? "active" : ""}`}
                    onClick={() => {
                      setActiveMenu(item.name);
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

        {/* Sign Out Button */}
        <div className="sidebar-footer p-3 border-top">
          <button
            className="w-100 sign-out-btn border-0 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-semibold text-danger bg-transparent"
            onClick={() => {
              if (window.confirm("Are you sure you want to sign out?")) {
                onNavigate("login");
              }
            }}
          >
            <i className="bi bi-box-arrow-left fs-5"></i>
            <span>Sign Out</span>
          </button>
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
        <div className="admin-main-header d-none d-lg-flex justify-content-end align-items-center mb-4">
          <button
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2.5 fw-bold"
            onClick={() => setShowTournamentModal(true)}
            style={{
              borderRadius: "8px",
              fontSize: "14px",
              letterSpacing: "0.5px",
            }}
          >
            <i className="bi bi-plus-lg fs-5"></i>
            <span>CREATE NEW TOURNAMENT</span>
          </button>
        </div>

        {/* Dynamic content placeholder - for simulation, we focus on Tournaments menu */}
        {activeMenu === "Tournaments" ? (
          <div className="row g-4 mt-2 mt-lg-0">
            {/* Left Column: Active Tournaments Table */}
            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <h1 className="h4 fw-bold text-dark-navy m-0">
                    Active Tournaments
                  </h1>
                  <span
                    className="text-secondary-custom"
                    style={{ fontSize: "13px" }}
                  >
                    Showing {tournaments.length} active tournaments
                  </span>
                </div>

                {/* Tournament List Table */}
                <div className="table-responsive">
                  <table className="table table-hover align-middle custom-tourney-table mb-0">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="text-secondary-custom fw-semibold"
                        >
                          TOURNAMENT DETAILS
                        </th>
                        <th
                          scope="col"
                          className="text-secondary-custom fw-semibold"
                        >
                          DATES
                        </th>
                        <th
                          scope="col"
                          className="text-secondary-custom fw-semibold d-none d-md-table-cell"
                        >
                          RACES
                        </th>
                        <th
                          scope="col"
                          className="text-secondary-custom fw-semibold d-none d-md-table-cell"
                        >
                          STATUS
                        </th>
                        <th scope="col" style={{ width: "40px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tournaments.map((t) => (
                        <tr
                          key={t.id}
                          className={`tourney-row-item ${selectedId === t.id ? "table-active-selected" : ""}`}
                          onClick={() => setSelectedId(t.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>
                            <div className="fw-bold text-dark-navy tourney-title">
                              {t.name}
                            </div>
                            <div
                              className="text-secondary-custom font-monospace"
                              style={{ fontSize: "11px" }}
                            >
                              {t.id}
                            </div>
                          </td>
                          <td className="fw-semibold text-secondary-custom">
                            {t.dates ||
                              (t.startDate && t.endDate
                                ? `${new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })} - ${new Date(t.endDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}`
                                : "N/A")}
                          </td>
                          <td className="fw-semibold text-dark-navy d-none d-md-table-cell">
                            {t.numRaces ?? t.raceCount ?? 0} Races
                          </td>
                          <td className="d-none d-md-table-cell">
                            <span
                              className={`status-badge-custom ${t.status ? t.status.toLowerCase() : "draft"}`}
                            >
                              {t.status || "DRAFT"}
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
              </div>
            </div>

            {/* Right Column: Selected Tournament Details Sidebar */}
            <div className="col-12 col-xl-4">
              {selectedTourney ? (
                <div className="card border-0 shadow-sm rounded-3 bg-white h-100 overflow-hidden">
                  {/* Details Header */}
                  <div className="card-header bg-white border-bottom p-4">
                    <h3 className="h5 fw-bold text-dark-navy mb-4">
                      Tournament Details
                    </h3>
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span
                          className="text-secondary-custom fw-semibold"
                          style={{ fontSize: "13px" }}
                        >
                          STATUS
                        </span>
                        <span
                          className={`status-badge-custom ${selectedTourney.status === "PUBLISHED" ? "published" : "draft"}`}
                        >
                          {selectedTourney.status}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span
                          className="text-secondary-custom fw-semibold"
                          style={{ fontSize: "13px" }}
                        >
                          TOTAL ENTRIES
                        </span>
                        <span className="fw-bold text-dark-navy">
                          {tournamentDetails?.totalEntries ??
                            selectedTourney?.totalEntries ??
                            "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Race Schedule */}
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4
                        className="text-uppercase fw-bold text-secondary-custom m-0"
                        style={{ fontSize: "12px", letterSpacing: "0.5px" }}
                      >
                        RACE SCHEDULE ({tournamentRaces.length})
                      </h4>
                      <button
                        className="btn btn-link text-decoration-none p-0 text-primary-custom fw-semibold d-flex align-items-center gap-1"
                        onClick={() => setShowRaceModal(true)}
                        style={{ fontSize: "13px" }}
                      >
                        <i className="bi bi-plus-lg"></i> Add new races
                      </button>
                    </div>

                    {/* Races list */}
                    <div className="d-flex flex-column gap-3">
                      {tournamentRaces && tournamentRaces.length > 0 ? (
                        tournamentRaces.map((race) => (
                          <div
                            key={race.id || Math.random()}
                            className="race-schedule-box p-3 rounded-3 border"
                          >
                            <div className="d-flex justify-content-between align-items-start gap-2 mb-2 flex-wrap">
                              <h5
                                className="fw-bold text-dark-navy m-0"
                                style={{ fontSize: "15px" }}
                              >
                                {race.name || "Unnamed Race"}
                              </h5>
                              <div className="d-flex gap-1.5 flex-wrap">
                                {race.code && (
                                  <span className="badge-custom-code">
                                    {race.code}
                                  </span>
                                )}
                                <span
                                  className={`status-badge-custom ${race.status ? race.status.toLowerCase() : "draft"}`}
                                >
                                  {race.status || "DRAFT"}
                                </span>
                              </div>
                            </div>
                            <div
                              className="text-secondary-custom d-flex align-items-center gap-1.5 flex-wrap"
                              style={{ fontSize: "12px" }}
                            >
                              {race.date && (
                                <>
                                  <i className="bi bi-calendar-event"></i>
                                  <span>{race.date}</span>
                                  <span className="text-muted mx-1">•</span>
                                </>
                              )}
                              <i className="bi bi-clock"></i>
                              <span>
                                {race.time || race.startTime || "TBD"} •{" "}
                                <strong>{race.laps || 0} Laps</strong>
                              </span>
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
                </div>
              ) : (
                <div className="card border-0 shadow-sm rounded-3 bg-white h-100 p-4 d-flex align-items-center justify-content-center">
                  <span className="text-muted">
                    Loading or no tournament selected...
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-3 p-5 text-center bg-white mt-2 mt-lg-0">
            <i className="bi bi-gear-wide-connected fs-1 text-muted mb-3 d-block"></i>
            <h2 className="h4 fw-bold text-dark-navy mb-2">{activeMenu}</h2>
            <p
              className="text-secondary-custom max-width-md mx-auto mb-0"
              style={{ fontSize: "14px" }}
            >
              This section is currently being simulated. Only the{" "}
              <strong>Tournaments</strong> menu is active for this mock.
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
            <h4 className="fw-bold text-dark-navy mb-3">
              Create New Tournament
            </h4>

            <form onSubmit={handleCreateTournament}>
              <div className="mb-3">
                <label
                  className="form-label text-secondary-custom fw-semibold"
                  style={{ fontSize: "13px" }}
                >
                  Tournament Name
                </label>
                <input
                  type="text"
                  className="form-control py-2 px-3"
                  placeholder="e.g. Royal Ascot Invitational"
                  value={newTourneyName}
                  onChange={(e) => setNewTourneyName(e.target.value)}
                  required
                  style={{ borderRadius: "8px" }}
                />
              </div>
              <div className="mb-3">
                <label
                  className="form-label text-secondary-custom fw-semibold"
                  style={{ fontSize: "13px" }}
                >
                  Tournament Dates
                </label>
                <input
                  type="text"
                  className="form-control py-2 px-3"
                  placeholder="e.g. Nov 02 - Nov 05"
                  value={newTourneyDates}
                  onChange={(e) => setNewTourneyDates(e.target.value)}
                  required
                  style={{ borderRadius: "8px" }}
                />
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-light px-4"
                  onClick={() => setShowTournamentModal(false)}
                  style={{ borderRadius: "8px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-bold"
                  style={{ borderRadius: "8px" }}
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
          <div
            className="modal-card-custom bg-white rounded-3 shadow-lg position-relative border overflow-hidden"
            style={{ maxWidth: "400px" }}
          >
            {/* Modal Header */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <h4
                className="fw-bold text-dark-navy mb-0"
                style={{ fontSize: "18px" }}
              >
                Add New Race
              </h4>
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
                <label
                  className="form-label text-secondary-custom fw-bold text-uppercase"
                  style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                >
                  RACE NAME
                </label>
                <input
                  type="text"
                  className="form-control py-2 px-3 border-light-gray"
                  placeholder="e.g. Platinum Jubilee Stakes"
                  value={newRaceName}
                  onChange={(e) => setNewRaceName(e.target.value)}
                  required
                  style={{ borderRadius: "6px", fontSize: "14px" }}
                />
              </div>

              {/* Date & Laps */}
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label
                    className="form-label text-secondary-custom fw-bold text-uppercase"
                    style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                  >
                    DATE
                  </label>
                  <input
                    type="date"
                    className="form-control py-2 px-2 border-light-gray"
                    value={newRaceDate}
                    onChange={(e) => setNewRaceDate(e.target.value)}
                    required
                    style={{ borderRadius: "6px", fontSize: "13px" }}
                  />
                </div>
                <div className="col-6">
                  <label
                    className="form-label text-secondary-custom fw-bold text-uppercase"
                    style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                  >
                    LAPS
                  </label>
                  <input
                    type="number"
                    className="form-control py-2 px-3 border-light-gray"
                    value={newRaceLaps}
                    onChange={(e) => setNewRaceLaps(e.target.value)}
                    required
                    min="1"
                    style={{ borderRadius: "6px", fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Start Time & End Time */}
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label
                    className="form-label text-secondary-custom fw-bold text-uppercase"
                    style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                  >
                    START TIME
                  </label>
                  <input
                    type="time"
                    className="form-control py-2 px-2 border-light-gray"
                    value={newRaceStartTime}
                    onChange={(e) => setNewRaceStartTime(e.target.value)}
                    required
                    style={{ borderRadius: "6px", fontSize: "13px" }}
                  />
                </div>
                <div className="col-6">
                  <label
                    className="form-label text-secondary-custom fw-bold text-uppercase"
                    style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                  >
                    END TIME
                  </label>
                  <input
                    type="time"
                    className="form-control py-2 px-2 border-light-gray"
                    value={newRaceEndTime}
                    onChange={(e) => setNewRaceEndTime(e.target.value)}
                    required
                    style={{ borderRadius: "6px", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Horse */}
              <div className="mb-3">
                <label
                  className="form-label text-secondary-custom fw-bold text-uppercase"
                  style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                >
                  HORSE
                </label>
                <select
                  className="form-select py-2 px-3 border-light-gray"
                  value={newRaceHorse}
                  onChange={(e) => setNewRaceHorse(e.target.value)}
                  style={{ borderRadius: "6px", fontSize: "14px" }}
                >
                  <option value="">Select Horse</option>
                  {MOCK_HORSES.map((h, index) => (
                    <option key={index} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Referee */}
              <div className="mb-4">
                <label
                  className="form-label text-secondary-custom fw-bold text-uppercase"
                  style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                >
                  REFEREE
                </label>
                <select
                  className="form-select py-2 px-3 border-light-gray"
                  value={newRaceReferee}
                  onChange={(e) => setNewRaceReferee(e.target.value)}
                  style={{ borderRadius: "6px", fontSize: "14px" }}
                >
                  <option value="">Select Referee</option>
                  {MOCK_REFEREES.map((r, index) => (
                    <option key={index} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 fw-bold text-uppercase text-center"
                style={{
                  borderRadius: "6px",
                  fontSize: "13px",
                  letterSpacing: "0.5px",
                }}
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
