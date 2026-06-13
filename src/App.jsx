import React, { useState } from 'react';
import LoginOtp from './pages/LoginOtp';
import Register from './pages/Register';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <>
      {/* Demo Selector (only for previewing both screens conveniently) */}
      <div className="demo-control-bar d-flex justify-content-between align-items-center">
        <span className="small fw-bold text-secondary text-uppercase tracking-wider">Demo Screen Toggle:</span>
        <div className="btn-group btn-group-sm" role="group" aria-label="Demo page switcher">
          <button
            type="button"
            className={`btn btn-sm ${currentPage === 'login' ? 'btn-primary continue-btn px-3' : 'btn-outline-secondary'}`}
            onClick={() => setCurrentPage('login')}
          >
            HRTMS (Login & OTP)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${currentPage === 'register' ? 'btn-primary continue-btn px-3' : 'btn-outline-secondary'}`}
            onClick={() => setCurrentPage('register')}
          >
            RoyalTurf (Register)
          </button>
        </div>
      </div>

      {/* Render Current Active Page */}
      {currentPage === 'login' ? (
        <LoginOtp onNavigate={setCurrentPage} />
      ) : (
        <Register onNavigate={setCurrentPage} />
      )}
    </>
  );
}

export default App;
