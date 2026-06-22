import { useState, useEffect } from "react";
import horseLightningImg from "../assets/horse_lightning_strike.png";
import horseMidnightImg from "../assets/horse_midnight_runner.png";

const HORSES = [
  {
    id: 1,
    name: "Lightning Strike",
    jockey: "M. Smith",
    odds: "2/1",
    img: horseLightningImg,
  },
  {
    id: 2,
    name: "Midnight Runner",
    jockey: "T. Clark",
    odds: "5/2",
    img: horseMidnightImg,
  },
  { id: 3, name: "Golden Gallop", jockey: "J. Doe", odds: "4/1", img: "" },
  { id: 4, name: "Silver Swift", jockey: "A. Carter", odds: "6/1", img: "" },
  { id: 5, name: "Bronze Bullet", jockey: "L. Miller", odds: "8/1", img: "" },
  { id: 6, name: "Stormy Sea", jockey: "R. Davis", odds: "10/1", img: "" },
  { id: 7, name: "Blazing Star", jockey: "S. Wilson", odds: "12/1", img: "" },
  {
    id: 8,
    name: "Shadow Dancer",
    jockey: "K. Thompson",
    odds: "15/1",
    img: "",
  },
  {
    id: 9,
    name: "Wind Whisperer",
    jockey: "P. Anderson",
    odds: "20/1",
    img: "",
  },
  { id: 10, name: "Eclipse Rider", jockey: "M. Thomas", odds: "25/1", img: "" },
];

// eslint-disable-next-line no-unused-vars
export default function SpectatorHome({ onNavigate }) {
  // Navigation active tab
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState("races");
=======
  const [activeTab, setActiveTab] = useState('races');
  const [menuOpen, setMenuOpen] = useState(false);
>>>>>>> 229631a91896fa2950c9a1b981b23c4e6364261e

  // Accordion open/collapse states
  const [expandedTournament, setExpandedTournament] =
    useState("spring-prestige");
  const [expandedRace, setExpandedRace] = useState("race-1");

  // Simulation states for live tracking positions
  const [isSimulating, setIsSimulating] = useState(true);
  const [runnerPositions, setRunnerPositions] = useState({
    runner1: 62,
    runner2: 45,
    runner3: 20,
    runner4: 35,
    runner5: 55,
    runner6: 30,
    runner7: 15,
    runner8: 50,
    runner9: 25,
    runner10: 40,
  });

  // Betting / Prediction Form states
  const [walletBalance, setWalletBalance] = useState(1250);
  const [selectedWinner, setSelectedWinner] = useState("");
  const [bidPoints, setBidPoints] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccessMsg, setBidSuccessMsg] = useState("");
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Simulated live tracking position updater
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setRunnerPositions((prev) => {
        const next = { ...prev };
        let resetAll = false;

        for (let i = 1; i <= 10; i++) {
          const key = `runner${i}`;
          next[key] =
            (prev[key] || 15) +
            (Math.random() > 0.45 ? Math.floor(Math.random() * 4) + 1 : 0);
          if (next[key] >= 80) {
            resetAll = true;
          }
        }

        if (resetAll) {
          for (let i = 1; i <= 10; i++) {
            next[`runner${i}`] = 10 + Math.floor(Math.random() * 10);
          }
        }

        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Handle prediction submission
  const handleSubmitBid = (e) => {
    e.preventDefault();
    setBidError("");
    setBidSuccessMsg("");

    if (!selectedWinner) {
      setBidError("Please select a winner.");
      return;
    }

    const points = parseInt(bidPoints, 10);
    if (isNaN(points) || points <= 0) {
      setBidError("Please enter a valid number of points greater than 0.");
      return;
    }

    if (points > walletBalance) {
      setBidError(
        `Insufficient balance. You only have ${walletBalance} points.`,
      );
      return;
    }

    // Process simulated API request
    setIsSubmittingBid(true);
    setTimeout(() => {
      setWalletBalance((prev) => prev - points);
      const horse = HORSES.find((h) => h.id.toString() === selectedWinner);
      const horseName = horse ? horse.name : "Unknown";
      setBidSuccessMsg(
        `Bid placed! You bid ${points} points on #${selectedWinner} ${horseName}.`,
      );
      setBidPoints("");
      setSelectedWinner("");
      setIsSubmittingBid(false);
    }, 1200);
  };

  const resetPositions = () => {
    setRunnerPositions({
      runner1: 15,
      runner2: 15,
      runner3: 15,
      runner4: 15,
      runner5: 15,
      runner6: 15,
      runner7: 15,
      runner8: 15,
      runner9: 15,
      runner10: 15,
    });
  };

  return (
    <div className="spectator-page-wrapper pb-5">
      {/* Top Navbar */}
      <nav className="main-navbar d-flex justify-content-between align-items-center mb-4 shadow-sm py-2 px-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn border-0 p-0 text-dark-navy menu-toggle-btn" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>
            <i className="bi bi-list fs-3"></i>
          </button>
          <span className="brand-logo fs-4 fw-bold text-primary-custom d-flex align-items-center gap-2">
            HRTMS
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav d-flex align-items-center gap-1">
          <a
            href="#races"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("races");
            }}
            className={`nav-item-custom ${activeTab === "races" ? "active" : ""}`}
          >
            <i className="bi bi-flag-fill"></i>
            <span>Races</span>
          </a>
          <a
            href="#wallet"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("wallet");
            }}
            className={`nav-item-custom ${activeTab === "wallet" ? "active" : ""}`}
          >
            <i className="bi bi-wallet2"></i>
            <span>Wallet</span>
          </a>
          <a
            href="#horse"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("horse");
            }}
            className={`nav-item-custom ${activeTab === "horse" ? "active" : ""}`}
          >
            <i className="bi bi-award"></i>
            <span>Horse</span>
          </a>
          <a
            href="#alerts"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("alerts");
            }}
            className={`nav-item-custom ${activeTab === "alerts" ? "active" : ""}`}
          >
            <i className="bi bi-bell"></i>
            <span>Alerts</span>
          </a>
          <a
            href="#profile"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("profile");
            }}
            className={`nav-item-custom ${activeTab === "profile" ? "active" : ""}`}
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
              href="#races"
              onClick={(e) => { e.preventDefault(); setActiveTab('races'); setMenuOpen(false); }}
              className={`drawer-link ${activeTab === 'races' ? 'active' : ''}`}
            >
              <i className="bi bi-flag-fill"></i>
              <span>Races</span>
            </a>
            <a
              href="#wallet"
              onClick={(e) => { e.preventDefault(); setActiveTab('wallet'); setMenuOpen(false); }}
              className={`drawer-link ${activeTab === 'wallet' ? 'active' : ''}`}
            >
              <i className="bi bi-wallet2"></i>
              <span>Wallet</span>
            </a>
            <a
              href="#horse"
              onClick={(e) => { e.preventDefault(); setActiveTab('horse'); setMenuOpen(false); }}
              className={`drawer-link ${activeTab === 'horse' ? 'active' : ''}`}
            >
              <i className="bi bi-award"></i>
              <span>Horse</span>
            </a>
            <a
              href="#alerts"
              onClick={(e) => { e.preventDefault(); setActiveTab('alerts'); setMenuOpen(false); }}
              className={`drawer-link ${activeTab === 'alerts' ? 'active' : ''}`}
            >
              <i className="bi bi-bell"></i>
              <span>Alerts</span>
            </a>
            <a
              href="#profile"
              onClick={(e) => { e.preventDefault(); setActiveTab('profile'); setMenuOpen(false); }}
              className={`drawer-link ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <i className="bi bi-person-circle"></i>
              <span>Profile</span>
            </a>
          </div>
        </div>

        {/* Demo Navigation Helper button (navigates back to login/register if needed) */}
        <div className="d-flex gap-2 align-items-center">
          <div
            className="bg-light px-3 py-1 rounded-pill border d-none d-sm-flex align-items-center gap-2"
            style={{ fontSize: 13 }}
          >
            <span className="text-secondary-custom">Balance:</span>
            <span className="fw-bold text-dark-navy">{walletBalance} pts</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="spectator-content-container">
        <div className="container-fluid px-3 px-md-4">
          {/* Title and Top Header Actions */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 fw-bold text-dark-navy m-0">Tournaments</h1>
            <a
              href="#past-events"
              className="text-decoration-none text-primary-custom fw-semibold d-flex align-items-center gap-1 hover-primary"
              style={{ fontSize: "14px" }}
            >
              <i className="bi bi-clock-history"></i> Past Events
            </a>
          </div>

          {/* Tournament Cards List */}
          <div className="tournament-list">
            {/* Card 1: Spring Prestige */}
            <div className="tournament-card">
              <div
                className="tournament-header d-flex justify-content-between align-items-center"
                onClick={() =>
                  setExpandedTournament(
                    expandedTournament === "spring-prestige"
                      ? ""
                      : "spring-prestige",
                  )
                }
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-light-blue p-2 rounded-3 text-primary-custom d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: "rgba(27, 96, 236, 0.08)",
                      width: 44,
                      height: 44,
                    }}
                  >
                    <i className="bi bi-trophy fs-5 text-primary-custom"></i>
                  </div>
                  <div>
                    <h2
                      className="h5 fw-bold text-dark-navy mb-0"
                      style={{ fontSize: "17px" }}
                    >
                      Spring Prestige
                    </h2>
                    <span
                      className="text-secondary-custom"
                      style={{ fontSize: "13px" }}
                    >
                      4 Races • Apr 12 - May 15
                    </span>
                  </div>
                </div>
                <button className="btn border-0 p-1 text-secondary-custom">
                  <i
                    className={`bi ${expandedTournament === "spring-prestige" ? "bi-chevron-up" : "bi-chevron-down"} fs-5`}
                  ></i>
                </button>
              </div>

              {/* Tournament Details Body */}
              {expandedTournament === "spring-prestige" && (
                <div className="tournament-body p-3 p-md-4">
                  {/* Race 1 Card: Sprint Stakes (Live) */}
                  <div
                    className={`race-accordion-item ${expandedRace === "race-1" ? "is-expanded" : ""}`}
                  >
                    <div
                      className="race-accordion-header"
                      onClick={() =>
                        setExpandedRace(
                          expandedRace === "race-1" ? "" : "race-1",
                        )
                      }
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="race-status-col">
                          <span className="pulsing-live-badge text-uppercase text-center w-100 m-0">
                            Live
                          </span>
                        </div>
                        <span className="fw-bold text-dark-navy">
                          Race 1: Sprint Stakes
                        </span>
                      </div>
                      <button className="btn border-0 p-1 text-secondary-custom">
                        <i
                          className={`bi ${expandedRace === "race-1" ? "bi-dash-lg" : "bi-plus-lg"}`}
                        ></i>
                      </button>
                    </div>

                    {expandedRace === "race-1" && (
                      <div className="race-accordion-body">
                        <div className="row g-4">
                          {/* Left Column: Track Position + Participating Teams */}
                          <div className="col-12 col-lg-8">
                            {/* Live Track Position Header */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span
                                className="text-uppercase fw-bold text-secondary-custom"
                                style={{
                                  fontSize: "12px",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Live Track Position
                              </span>

                              {/* Live simulation controls to wow the user */}
                              <div className="d-flex align-items-center gap-2">
                                <button
                                  className="btn btn-sm btn-outline-secondary py-0 px-2 d-flex align-items-center gap-1"
                                  onClick={() => setIsSimulating(!isSimulating)}
                                  style={{
                                    fontSize: "11px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  <i
                                    className={`bi ${isSimulating ? "bi-pause-fill" : "bi-play-fill"}`}
                                  ></i>
                                  {isSimulating ? "Pause" : "Resume"}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary py-0 px-2 d-flex align-items-center gap-1"
                                  onClick={resetPositions}
                                  style={{
                                    fontSize: "11px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  <i className="bi bi-arrow-counterclockwise"></i>
                                  Reset
                                </button>
                              </div>
                            </div>

                            {/* Live Track Lane visual */}
                            <div className="live-track-road mb-4">
                              {/* Finish Line */}
                              <div className="live-track-finish-line"></div>

                              {/* Dynamically render all 10 runners */}
                              {HORSES.map((horse) => {
                                const pos =
                                  runnerPositions[`runner${horse.id}`] || 15;
                                const topPercent = 8 + (horse.id - 1) * 9.2;
                                const isYellow = horse.id % 2 === 0;
                                return (
                                  <div
                                    key={horse.id}
                                    className="runner-avatar-wrapper"
                                    style={{
                                      left: `${pos}%`,
                                      transform: "translateY(-50%)",
                                      top: `${topPercent}%`,
                                      zIndex: horse.id,
                                    }}
                                    title={horse.name}
                                  >
                                    <div
                                      className={`runner-badge ${isYellow ? "runner-yellow" : "runner-blue"}`}
                                      style={{
                                        width: 18,
                                        height: 18,
                                        fontSize: 9,
                                        borderWidth: 1.5,
                                        boxShadow: "none",
                                      }}
                                    >
                                      {horse.id}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Participating Teams Grid */}
                            <div className="participating-teams-section">
                              <h3
                                className="text-uppercase fw-bold text-secondary-custom mb-3"
                                style={{
                                  fontSize: "12px",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Participating Teams
                              </h3>
                              <div className="row g-3">
                                {HORSES.map((horse) => (
                                  <div
                                    key={horse.id}
                                    className="col-12 col-sm-6 col-md-4 col-lg-6"
                                  >
                                    <div className="participating-team-card">
                                      {horse.img ? (
                                        <img
                                          src={horse.img}
                                          alt={horse.name}
                                          className="team-horse-img border"
                                        />
                                      ) : (
                                        <div
                                          className="team-horse-img border bg-light d-flex align-items-center justify-content-center"
                                          style={{
                                            width: 54,
                                            height: 54,
                                            borderRadius: 8,
                                          }}
                                        >
                                          <i className="bi bi-image text-muted fs-4"></i>
                                        </div>
                                      )}
                                      <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                          <span
                                            className="fw-bold text-primary-custom"
                                            style={{ fontSize: "14px" }}
                                          >
                                            #{horse.id}
                                          </span>
                                          <span className="odds-badge">
                                            {horse.odds}
                                          </span>
                                        </div>
                                        <h4
                                          className="fw-bold text-dark-navy mb-0"
                                          style={{ fontSize: "15px" }}
                                        >
                                          {horse.name}
                                        </h4>
                                        <span
                                          className="text-secondary-custom"
                                          style={{ fontSize: "12px" }}
                                        >
                                          <i className="bi bi-person me-1"></i>
                                          Jockey:{" "}
                                          <strong>{horse.jockey}</strong>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Make a Prediction Form */}
                          <div className="col-12 col-lg-4">
                            <div className="prediction-card h-100 d-flex flex-column justify-content-between">
                              <div>
                                <div className="prediction-title text-uppercase mb-3">
                                  <i className="bi bi-sparkles"></i> Make a
                                  Prediction
                                </div>

                                {bidSuccessMsg && (
                                  <div
                                    className="alert alert-success alert-dismissible fade show p-2 mb-3"
                                    style={{ fontSize: "13px" }}
                                    role="alert"
                                  >
                                    <i className="bi bi-check-circle-fill me-1"></i>{" "}
                                    {bidSuccessMsg}
                                    <button
                                      type="button"
                                      className="btn-close p-2"
                                      onClick={() => setBidSuccessMsg("")}
                                      aria-label="Close"
                                    ></button>
                                  </div>
                                )}

                                {bidError && (
                                  <div
                                    className="alert alert-danger p-2 mb-3"
                                    style={{ fontSize: "13px" }}
                                  >
                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>{" "}
                                    {bidError}
                                  </div>
                                )}

                                <form onSubmit={handleSubmitBid}>
                                  <div className="mb-3">
                                    <label
                                      htmlFor="selectWinner"
                                      className="form-label text-secondary-custom fw-semibold mb-1"
                                      style={{ fontSize: "13px" }}
                                    >
                                      Your Winner
                                    </label>
                                    <select
                                      id="selectWinner"
                                      className="form-select form-select-sm py-2"
                                      value={selectedWinner}
                                      onChange={(e) =>
                                        setSelectedWinner(e.target.value)
                                      }
                                      style={{
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                      }}
                                    >
                                      <option value="">Select Winner...</option>
                                      {HORSES.map((horse) => (
                                        <option key={horse.id} value={horse.id}>
                                          #{horse.id} {horse.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="d-flex gap-2">
                                    <div className="flex-grow-1">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm py-2 px-3 text-center"
                                        placeholder="Points"
                                        value={bidPoints}
                                        onChange={(e) =>
                                          setBidPoints(e.target.value)
                                        }
                                        style={{
                                          borderRadius: "8px",
                                          fontSize: "14px",
                                        }}
                                        min="1"
                                      />
                                    </div>
                                    <button
                                      type="submit"
                                      className="btn btn-primary d-flex align-items-center justify-content-center gap-1 continue-btn py-2 px-3 fw-bold flex-shrink-0"
                                      style={{
                                        fontSize: "13px",
                                        borderRadius: "8px",
                                      }}
                                      disabled={isSubmittingBid}
                                    >
                                      {isSubmittingBid ? (
                                        <span
                                          className="spinner-border spinner-border-sm"
                                          role="status"
                                          aria-hidden="true"
                                        ></span>
                                      ) : (
                                        <>
                                          Submit Bid{" "}
                                          <i className="bi bi-arrow-right-short fs-5"></i>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </form>
                              </div>

                              {/* Wallet Info for Mobile (inline inside prediction card) */}
                              <div className="mt-4 pt-3 border-top d-sm-none">
                                <div className="d-flex justify-content-between align-items-center">
                                  <span
                                    className="text-secondary-custom"
                                    style={{ fontSize: "13px" }}
                                  >
                                    Wallet Balance:
                                  </span>
                                  <span className="fw-bold text-dark-navy">
                                    {walletBalance} points
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Race 2 Card: Golden Cup (Collapsed) */}
                  <div
                    className={`race-accordion-item ${expandedRace === "race-2" ? "is-expanded" : ""}`}
                  >
                    <div
                      className="race-accordion-header"
                      onClick={() =>
                        setExpandedRace(
                          expandedRace === "race-2" ? "" : "race-2",
                        )
                      }
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="race-status-col text-secondary-custom fw-semibold">
                          <span>14:30</span>
                        </div>
                        <span className="fw-bold text-dark-navy">
                          Race 2: Golden Cup
                        </span>
                      </div>
                      <button className="btn border-0 p-1 text-secondary-custom">
                        <i
                          className={`bi ${expandedRace === "race-2" ? "bi-dash-lg" : "bi-plus-lg"}`}
                        ></i>
                      </button>
                    </div>

                    {expandedRace === "race-2" && (
                      <div className="race-accordion-body">
                        <p
                          className="text-muted mb-0"
                          style={{ fontSize: "13px" }}
                        >
                          This race starts at 14:30. Predictions will open 1
                          hour before the event.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Summer Derby Series (Collapsed) */}
            <div className="tournament-card">
              <div
                className="tournament-header d-flex justify-content-between align-items-center"
                onClick={() =>
                  setExpandedTournament(
                    expandedTournament === "summer-derby" ? "" : "summer-derby",
                  )
                }
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-light-blue p-2 rounded-3 text-warning d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: "rgba(255, 193, 7, 0.08)",
                      width: 44,
                      height: 44,
                    }}
                  >
                    <i className="bi bi-brightness-high fs-5 text-warning"></i>
                  </div>
                  <div>
                    <h2
                      className="h5 fw-bold text-dark-navy mb-0"
                      style={{ fontSize: "17px" }}
                    >
                      Summer Derby Series
                    </h2>
                    <span
                      className="text-secondary-custom"
                      style={{ fontSize: "13px" }}
                    >
                      6 Races • Jun 01 - Jul 20
                    </span>
                  </div>
                </div>
                <button className="btn border-0 p-1 text-secondary-custom">
                  <i
                    className={`bi ${expandedTournament === "summer-derby" ? "bi-chevron-up" : "bi-chevron-down"} fs-5`}
                  ></i>
                </button>
              </div>

              {/* Tournament Details Body */}
              {expandedTournament === "summer-derby" && (
                <div className="tournament-body p-3 p-md-4">
                  <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                    This tournament details are not yet active. Check back later
                    in June!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="mobile-bottom-nav">
        <a
          href="#races"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("races");
          }}
          className={`nav-item-custom ${activeTab === "races" ? "active" : ""}`}
        >
          <i className="bi bi-flag-fill"></i>
          <span>Races</span>
        </a>
        <a
          href="#wallet"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("wallet");
          }}
          className={`nav-item-custom ${activeTab === "wallet" ? "active" : ""}`}
        >
          <i className="bi bi-wallet2"></i>
          <span>Wallet</span>
        </a>
        <a
          href="#horse"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("horse");
          }}
          className={`nav-item-custom ${activeTab === "horse" ? "active" : ""}`}
        >
          <i className="bi bi-award"></i>
          <span>Horse</span>
        </a>
        <a
          href="#alerts"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("alerts");
          }}
          className={`nav-item-custom ${activeTab === "alerts" ? "active" : ""}`}
        >
          <i className="bi bi-bell"></i>
          <span>Alerts</span>
        </a>
        <a
          href="#profile"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("profile");
          }}
          className={`nav-item-custom ${activeTab === "profile" ? "active" : ""}`}
        >
          <i className="bi bi-person-circle"></i>
          <span>Profile</span>
        </a>
      </div>
    </div>
  );
}
