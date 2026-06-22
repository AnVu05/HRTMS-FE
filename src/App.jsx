import { useState } from 'react';
import LoginOtp from './pages/LoginOtp';
import Register from './pages/Register';
import SpectatorHome from './pages/SpectatorHome';
import AdminDashboard from './pages/AdminDashboard';
import AdminNotifications from './pages/AdminNotifications';
import StableManagement from './pages/StableManagement';
import OwnerRaces from './pages/OwnerRaces';

const PAGES = ['login', 'register', 'spectator-home', 'admin-dashboard', 'admin-notifications', 'stable-management', 'owner-races'];

const INITIAL_HORSES = [
  {
    id: 1,
    name: 'Thunder Dash',
    breed: 'THOROUGHBRED',
    age: 4,
    weight: 520,
    wins: 12,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Silver Mist',
    breed: 'ARABIAN',
    age: 6,
    weight: 480,
    wins: 8,
    status: 'Training',
  },
  {
    id: 3,
    name: 'Midnight Ace',
    breed: 'QUARTER HORSE',
    age: 5,
    weight: 545,
    wins: 15,
    status: 'Resting',
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState('owner-races');
  const [horses, setHorses] = useState(INITIAL_HORSES);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':             return <LoginOtp onNavigate={setCurrentPage} />;
      case 'register':          return <Register onNavigate={setCurrentPage} />;
      case 'spectator-home':    return <SpectatorHome onNavigate={setCurrentPage} />;
      case 'admin-dashboard':   return <AdminDashboard onNavigate={setCurrentPage} />;
      case 'admin-notifications':return <AdminNotifications onNavigate={setCurrentPage} />;
      case 'stable-management': return <StableManagement onNavigate={setCurrentPage} horses={horses} setHorses={setHorses} />;
      case 'owner-races':       return <OwnerRaces onNavigate={setCurrentPage} horses={horses} />;
      default:                  return <LoginOtp onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
       {/* Dev navigation bar – remove in production */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', gap: 6, background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)', border: '1px solid #e2e8f0',
        borderRadius: '12px 12px 0 0', padding: '6px 14px',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginRight: 4 }}>DEV:</span>
        {PAGES.map(p => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 6, border: 'none',
              cursor: 'pointer', fontWeight: 600,
              background: currentPage === p ? '#1b60ec' : '#f1f5f9',
              color: currentPage === p ? '#fff' : '#475569',
              transition: 'all 0.15s',
            }}
          >
            {p}
          </button>
        ))}
      </div>


      {/* Page content */}
      <div 
        className={`app-page-container ${(currentPage === 'spectator-home' || currentPage === 'admin-dashboard' || currentPage === 'admin-notifications' || currentPage === 'stable-management' || currentPage === 'owner-races') ? 'full-width' : ''}`}
        style={{ paddingTop: (currentPage === 'spectator-home' || currentPage === 'admin-dashboard' || currentPage === 'admin-notifications' || currentPage === 'stable-management' || currentPage === 'owner-races') ? 0 : 40 }}
      >
        {renderPage()}
      </div>
    </>
  );
}

export default App;


