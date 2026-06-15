import { useState } from 'react';
import LoginOtp from './pages/LoginOtp';
import Register from './pages/Register';
import SpectatorHome from './pages/SpectatorHome';
import AdminDashboard from './pages/AdminDashboard';

const PAGES = ['login', 'register', 'spectator-home', 'admin-dashboard'];

function App() {
  const [currentPage, setCurrentPage] = useState('admin-dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'login':            return <LoginOtp onNavigate={setCurrentPage} />;
      case 'register':         return <Register onNavigate={setCurrentPage} />;
      case 'spectator-home':   return <SpectatorHome onNavigate={setCurrentPage} />;
      case 'admin-dashboard':  return <AdminDashboard onNavigate={setCurrentPage} />;
      default:                 return <LoginOtp onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      

      {/* Page content */}
      <div 
        className={`app-page-container ${(currentPage === 'spectator-home' || currentPage === 'admin-dashboard') ? 'full-width' : ''}`}
        style={{ paddingTop: (currentPage === 'spectator-home' || currentPage === 'admin-dashboard') ? 0 : 40 }}
      >
        {renderPage()}
      </div>
    </>
  );
}

export default App;
