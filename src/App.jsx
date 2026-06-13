import { useState } from 'react';
import LoginOtp from './pages/LoginOtp';
import Register from './pages/Register';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <>
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
