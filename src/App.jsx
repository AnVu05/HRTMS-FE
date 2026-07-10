import { useState, useEffect } from "react";
import AdminApp from "./pages/admin/AdminApp";
import DoctorApp from "./pages/doctor/DoctorApp";
import OwnerApp from "./pages/horse_owner/OwnerApp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Forbidden from "./pages/Forbidden";

const DummyComponent = ({ title }) => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold text-gray-500">
      {title} Page (Coming Soon)
    </h1>
  </div>
);

// THÊM VÀO ĐẦU FILE:
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// THÊM VÀO NGOÀI COMPONENT APP:
const queryClient = new QueryClient();

const getInitialPage = () => {
  const path = window.location.pathname;
  if (path === '/forgot-password') return "forgot-password";
  if (path === '/register') return "register";
  
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");
  if (!token || !role) return "login";
  if (role === "ADMIN") return "admin-dashboard";
  if (role === "DOCTOR") return "doctor-dashboard";
  if (role === "HORSE_OWNER") return "owner-home";
  if (role === "SPECTATOR") return "spectator-home";
  if (role === "JOCKEY") return "jockey-profile";
  if (role === "REFEREE") return "referee-dashboard";
  return "login";
};

const isPageAllowed = (page) => {
  if (page === "login" || page === "register" || page === "forgot-password" || page === "forbidden") return true;

  const token = localStorage.getItem("access_token");
  if (!token) return false;

  const role = localStorage.getItem("user_role");
  if (page === "admin-dashboard" && role !== "ADMIN") return false;
  if (page === "doctor-dashboard" && role !== "DOCTOR") return false;
  if (page === "owner-home" && role !== "HORSE_OWNER") return false;
  if (page === "spectator-home" && role !== "SPECTATOR") return false;
  if (page === "jockey-profile" && role !== "JOCKEY") return false;
  if (page === "referee-dashboard" && role !== "REFEREE") return false;

  return true;
};

function App() {
  const [currentPage, setCurrentPage] = useState(getInitialPage());

  useEffect(() => {
    if (currentPage === "admin-dashboard") {
      window.history.pushState(null, '', '/admin');
    } else if (currentPage === "doctor-dashboard") {
      window.history.pushState(null, '', '/doctor/health-check');
    } else if (currentPage === "owner-home") {
      window.history.pushState(null, '', '/owner-home');
    }
  }, [currentPage]);

  const renderPage = () => {
    if (!isPageAllowed(currentPage)) {
      return <Forbidden />;
    }

    switch (currentPage) {
      case "login":
        return <Login />;
      case "forgot-password":
        return <ForgotPassword />;
      case "register":
        return <DummyComponent title="Register" />;
      case "spectator-home":
        return <DummyComponent title="Spectator Home" />;
      case "admin-dashboard":
        return <AdminApp />;
      case "doctor-dashboard":
        return <DoctorApp />;
      case "owner-home":
        return <OwnerApp />;
      case "jockey-profile":
        return <DummyComponent title="Jockey Profile" />;
      case "referee-dashboard":
        return <DummyComponent title="Referee Dashboard" />;
      case "forbidden":
        return <Forbidden />;
      default:
        return <DummyComponent title="Login / OTP" />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {/* Page content */}
      <div
        className={`app-page-container ${currentPage === "spectator-home" || currentPage === "admin-dashboard" || currentPage === "doctor-dashboard" || currentPage === "owner-home" || currentPage === "jockey-profile" || currentPage === "referee-dashboard" || currentPage === "login" || currentPage === "forgot-password" || currentPage === "register" ? "full-width" : ""}`}
        style={{
          paddingTop:
            currentPage === "spectator-home" ||
              currentPage === "admin-dashboard" ||
              currentPage === "doctor-dashboard" ||
              currentPage === "owner-home" ||
              currentPage === "jockey-profile" ||
              currentPage === "referee-dashboard" ||
              currentPage === "login" ||
              currentPage === "forgot-password" ||
              currentPage === "register"
              ? 0
              : 40,
        }}
      >
        {renderPage()}
      </div>
      <Toaster
        toastOptions={{
          style: {
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #f87171'
          }
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
