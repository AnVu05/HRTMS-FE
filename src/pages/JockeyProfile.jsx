import { useState } from "react";

const MOCK_JOCKEY = {
  id: "J-8472",
  name: "Alexander Pierce",
  status: "Active",
  rank: "Elite Tier",
  location: "Lexington, KY",
  joined: "2018",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  stats: {
    races: 342,
    wins: 87,
    winRate: "25.4%",
    topThree: 156,
    earnings: "$1.2M",
    rating: 9.4
  },
  bio: "Alexander has been riding professionally for over 6 years. Known for his tactical pacing and strong finishes, he's a crowd favorite and a reliable choice for long-distance derbies. He recently secured a major victory at the Spring Prestige cup.",
  recentRaces: [
    { id: "R-102", date: "May 12, 2026", name: "Spring Prestige - Race 1", horse: "Lightning Strike", finish: "1st", odds: "2/1", points: "+500" },
    { id: "R-098", date: "May 05, 2026", name: "Derby Qualifier", horse: "Midnight Runner", finish: "3rd", odds: "5/2", points: "+150" },
    { id: "R-085", date: "Apr 28, 2026", name: "Lexington Sprint", horse: "Silver Swift", finish: "2nd", odds: "4/1", points: "+250" },
    { id: "R-072", date: "Apr 15, 2026", name: "Golden Cup Prelims", horse: "Stormy Sea", finish: "5th", odds: "8/1", points: "+50" },
  ],
  achievements: [
    { title: "Champion Sprint 2025", icon: "bi-trophy-fill", color: "text-warning", bg: "bg-warning" },
    { title: "100+ Wins Club", icon: "bi-star-fill", color: "text-primary", bg: "bg-primary" },
    { title: "Fastest Lap (May)", icon: "bi-lightning-fill", color: "text-danger", bg: "bg-danger" }
  ]
};

export default function JockeyProfile({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="spectator-page-wrapper pb-5" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <nav className="main-navbar d-flex justify-content-between align-items-center mb-4 shadow-sm py-2 px-3 bg-white">
        <div className="d-flex align-items-center gap-3">
          <button className="btn border-0 p-0 text-dark-navy menu-toggle-btn d-md-none" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>
            <i className="bi bi-list fs-3"></i>
          </button>
          <span className="brand-logo fs-4 fw-bold text-primary-custom d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => onNavigate('spectator-home')}>
            HRTMS
          </span>
        </div>
        
        {/* Profile specific header actions */}
        <div className="d-flex gap-3 align-items-center">
            <button className="btn btn-outline-primary btn-sm fw-semibold d-none d-sm-block" style={{ borderRadius: '8px' }}>
                <i className="bi bi-share me-1"></i> Share
            </button>
            <button className="btn btn-primary btn-sm fw-semibold" style={{ borderRadius: '8px', backgroundColor: 'var(--primary-blue)', border: 'none' }}>
                <i className="bi bi-heart me-1"></i> Favorite
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="spectator-content-container">
        <div className="container-fluid px-3 px-md-4">
          
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-3 d-none d-sm-block">
            <ol className="breadcrumb" style={{ fontSize: '13px' }}>
              <li className="breadcrumb-item"><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('spectator-home'); }} className="text-secondary-custom text-decoration-none hover-primary">Home</a></li>
              <li className="breadcrumb-item"><a href="#" className="text-secondary-custom text-decoration-none hover-primary">Jockeys</a></li>
              <li className="breadcrumb-item active text-dark-navy fw-semibold" aria-current="page">{MOCK_JOCKEY.name}</li>
            </ol>
          </nav>

          <div className="row g-4">
            {/* Left Column: Profile Card */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 mb-lg-0" style={{ transition: 'all 0.3s ease' }}>
                <div className="position-relative" style={{ height: '120px', background: 'linear-gradient(135deg, #1b60ec 0%, #09132c 100%)' }}>
                   {/* Background pattern */}
                   <div className="position-absolute w-100 h-100" style={{ opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                </div>
                
                <div className="card-body px-4 pb-4 pt-0 text-center position-relative">
                  <div className="position-relative d-inline-block" style={{ marginTop: '-60px', marginBottom: '16px' }}>
                    <img 
                        src={MOCK_JOCKEY.avatar} 
                        alt={MOCK_JOCKEY.name}
                        className="rounded-circle border border-4 border-white shadow-sm"
                        style={{ width: '120px', height: '120px', objectFit: 'cover', backgroundColor: '#e2e8f0' }}
                    />
                    <div className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle" style={{ width: '20px', height: '20px', right: '10px', bottom: '5px' }} title="Active"></div>
                  </div>
                  
                  <h2 className="h4 fw-bold text-dark-navy mb-1">{MOCK_JOCKEY.name}</h2>
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                    <span className="badge bg-light text-primary-custom border px-2 py-1" style={{ fontSize: '12px' }}>{MOCK_JOCKEY.rank}</span>
                    <span className="badge bg-light text-secondary-custom border px-2 py-1" style={{ fontSize: '12px' }}>{MOCK_JOCKEY.id}</span>
                  </div>

                  <p className="text-secondary-custom mb-4" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    {MOCK_JOCKEY.bio}
                  </p>

                  <div className="d-flex justify-content-between text-start border-top pt-3">
                    <div>
                        <div className="text-secondary-custom mb-1" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                        <div className="fw-semibold text-dark-navy" style={{ fontSize: '14px' }}><i className="bi bi-geo-alt-fill text-primary-custom me-1"></i>{MOCK_JOCKEY.location}</div>
                    </div>
                    <div className="text-end">
                        <div className="text-secondary-custom mb-1" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined</div>
                        <div className="fw-semibold text-dark-navy" style={{ fontSize: '14px' }}><i className="bi bi-calendar-check text-primary-custom me-1"></i>{MOCK_JOCKEY.joined}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements Card */}
              <div className="card border-0 shadow-sm rounded-4 mt-4 d-none d-lg-block">
                <div className="card-header bg-white border-0 pt-4 pb-2 px-4">
                    <h3 className="h6 fw-bold text-dark-navy m-0 text-uppercase" style={{ letterSpacing: '0.5px' }}>Achievements</h3>
                </div>
                <div className="card-body px-4 pb-4 pt-2">
                    <div className="d-flex flex-column gap-3">
                        {MOCK_JOCKEY.achievements.map((ach, idx) => (
                            <div key={idx} className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div className={`${ach.bg} bg-opacity-10 ${ach.color} rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                                    <i className={`bi ${ach.icon} fs-5`}></i>
                                </div>
                                <span className="fw-semibold text-dark-navy" style={{ fontSize: '14px' }}>{ach.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            {/* Right Column: Stats & Recent Races */}
            <div className="col-12 col-lg-8">
              
              {/* Stats Grid */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div className="text-secondary-custom mb-2 d-flex align-items-center gap-2" style={{ fontSize: '13px', fontWeight: '600' }}>
                            <i className="bi bi-flag-fill text-primary-custom"></i> Total Races
                        </div>
                        <div className="fs-3 fw-bold text-dark-navy">{MOCK_JOCKEY.stats.races}</div>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div className="text-secondary-custom mb-2 d-flex align-items-center gap-2" style={{ fontSize: '13px', fontWeight: '600' }}>
                            <i className="bi bi-trophy-fill text-warning"></i> Total Wins
                        </div>
                        <div className="fs-3 fw-bold text-dark-navy">{MOCK_JOCKEY.stats.wins}</div>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-primary text-white" style={{ transition: 'transform 0.2s', cursor: 'pointer', background: 'linear-gradient(135deg, #1b60ec 0%, #0d4ed1 100%)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div className="text-white-50 mb-2 d-flex align-items-center gap-2" style={{ fontSize: '13px', fontWeight: '600' }}>
                            <i className="bi bi-graph-up-arrow text-white"></i> Win Rate
                        </div>
                        <div className="fs-3 fw-bold text-white">{MOCK_JOCKEY.stats.winRate}</div>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div className="text-secondary-custom mb-2 d-flex align-items-center gap-2" style={{ fontSize: '13px', fontWeight: '600' }}>
                            <i className="bi bi-award-fill text-info"></i> Top 3 Finishes
                        </div>
                        <div className="fs-3 fw-bold text-dark-navy">{MOCK_JOCKEY.stats.topThree}</div>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div className="text-secondary-custom mb-2 d-flex align-items-center gap-2" style={{ fontSize: '13px', fontWeight: '600' }}>
                            <i className="bi bi-cash-stack text-success"></i> Earnings
                        </div>
                        <div className="fs-3 fw-bold text-dark-navy">{MOCK_JOCKEY.stats.earnings}</div>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div className="text-secondary-custom mb-2 d-flex align-items-center gap-2" style={{ fontSize: '13px', fontWeight: '600' }}>
                            <i className="bi bi-star-fill text-warning"></i> Rating
                        </div>
                        <div className="fs-3 fw-bold text-dark-navy">{MOCK_JOCKEY.stats.rating}<span className="fs-6 text-muted fw-normal">/10</span></div>
                    </div>
                </div>
              </div>
              
              {/* Mobile Achievements - Render here on small screens */}
              <div className="card border-0 shadow-sm rounded-4 mb-4 d-block d-lg-none">
                <div className="card-header bg-white border-0 pt-4 pb-2 px-4">
                    <h3 className="h6 fw-bold text-dark-navy m-0 text-uppercase" style={{ letterSpacing: '0.5px' }}>Achievements</h3>
                </div>
                <div className="card-body px-4 pb-4 pt-2">
                    <div className="d-flex flex-column gap-3">
                        {MOCK_JOCKEY.achievements.map((ach, idx) => (
                            <div key={idx} className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div className={`${ach.bg} bg-opacity-10 ${ach.color} rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                                    <i className={`bi ${ach.icon} fs-5`}></i>
                                </div>
                                <span className="fw-semibold text-dark-navy" style={{ fontSize: '14px' }}>{ach.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              {/* Tabs for detailed sections */}
              <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden mb-4">
                <div className="d-flex border-bottom px-2 px-sm-3 pt-3 flex-nowrap overflow-auto" style={{ whiteSpace: 'nowrap' }}>
                  <button 
                    className={`btn border-0 fw-semibold px-3 px-sm-4 pb-3 rounded-0 flex-shrink-0 ${activeTab === 'overview' ? 'text-primary-custom border-bottom border-primary border-3' : 'text-secondary-custom'}`}
                    onClick={() => setActiveTab('overview')}
                    style={{ fontSize: '14px' }}
                  >
                    Recent Races
                  </button>
                  <button 
                    className={`btn border-0 fw-semibold px-3 px-sm-4 pb-3 rounded-0 flex-shrink-0 ${activeTab === 'horses' ? 'text-primary-custom border-bottom border-primary border-3' : 'text-secondary-custom'}`}
                    onClick={() => setActiveTab('horses')}
                    style={{ fontSize: '14px' }}
                  >
                    Associated Horses
                  </button>
                  <button 
                    className={`btn border-0 fw-semibold px-3 px-sm-4 pb-3 rounded-0 flex-shrink-0 ${activeTab === 'media' ? 'text-primary-custom border-bottom border-primary border-3' : 'text-secondary-custom'}`}
                    onClick={() => setActiveTab('media')}
                    style={{ fontSize: '14px' }}
                  >
                    Media
                  </button>
                </div>

                <div className="p-3 p-sm-4">
                  {activeTab === 'overview' && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="h6 fw-bold text-dark-navy m-0">Recent Race History</h3>
                        <button className="btn btn-sm btn-link text-decoration-none p-0 text-primary-custom fw-semibold d-none d-sm-block" style={{ fontSize: '13px' }}>View Full History <i className="bi bi-arrow-right"></i></button>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px', minWidth: '600px' }}>
                          <thead className="table-light text-secondary-custom" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                            <tr>
                              <th className="fw-semibold rounded-start py-3 ps-3 border-0">Race Info</th>
                              <th className="fw-semibold py-3 border-0">Horse</th>
                              <th className="fw-semibold py-3 border-0">Odds</th>
                              <th className="fw-semibold py-3 text-center border-0">Finish</th>
                              <th className="fw-semibold rounded-end py-3 text-end pe-3 border-0">Points</th>
                            </tr>
                          </thead>
                          <tbody className="border-top-0">
                            {MOCK_JOCKEY.recentRaces.map((race, idx) => (
                              <tr key={idx} className="border-bottom" style={{ borderColor: '#e2e8f0' }}>
                                <td className="py-3 ps-3">
                                  <div className="fw-bold text-dark-navy mb-1" style={{ fontSize: '14px' }}>{race.name}</div>
                                  <div className="text-secondary-custom" style={{ fontSize: '12px' }}><i className="bi bi-calendar2-week me-1"></i>{race.date} • {race.id}</div>
                                </td>
                                <td className="py-3">
                                  <span className="fw-semibold text-primary-custom bg-light px-2 py-1 rounded-2 d-inline-block" style={{ fontSize: '13px' }}><i className="bi bi-suit-spade-fill me-1"></i>{race.horse}</span>
                                </td>
                                <td className="py-3 text-secondary-custom fw-semibold">{race.odds}</td>
                                <td className="py-3 text-center">
                                  <span className={`badge ${race.finish === '1st' ? 'bg-warning text-dark' : race.finish === '2nd' ? 'bg-secondary' : race.finish === '3rd' ? 'bg-danger text-white' : 'bg-light text-secondary-custom border'} rounded-pill px-3 py-2 d-inline-block`} style={{ fontSize: '12px', fontWeight: '700' }}>
                                    {race.finish === '1st' && <i className="bi bi-trophy-fill me-1"></i>}
                                    {race.finish}
                                  </span>
                                </td>
                                <td className="py-3 text-end pe-3 fw-bold text-success">{race.points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <button className="btn btn-outline-primary w-100 d-block d-sm-none mt-3 fw-semibold">View Full History</button>
                    </div>
                  )}

                  {activeTab === 'horses' && (
                    <div className="text-center py-5 text-secondary-custom">
                        <i className="bi bi-suit-spade-fill fs-1 text-light mb-3 d-block" style={{ color: '#cbd5e1' }}></i>
                        <h4 className="h6 fw-bold text-dark-navy">No associated horses found</h4>
                        <p style={{ fontSize: '14px' }}>This jockey does not have specific associated horses currently in the database.</p>
                    </div>
                  )}

                  {activeTab === 'media' && (
                    <div className="text-center py-5 text-secondary-custom">
                        <i className="bi bi-image fs-1 text-light mb-3 d-block" style={{ color: '#cbd5e1' }}></i>
                        <h4 className="h6 fw-bold text-dark-navy">Media Gallery Empty</h4>
                        <p style={{ fontSize: '14px' }}>There are no photos or videos available for this jockey yet.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
