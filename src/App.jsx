import { useState, useEffect } from "react";
import AdminApp from "./pages/admin/AdminApp";
import DoctorApp from "./pages/doctor/DoctorApp";

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
const PAGES = [
  "login",
  "register",
  "spectator-home",
  "admin-dashboard",
  "doctor-dashboard",
  "stable-management",
  "owner-races",
  "jockey-profile",
  "referee-dashboard",
];

const INITIAL_HORSES = [
  {
    id: 1,
    name: "Thunder Dash",
    breed: "THOROUGHBRED",
    age: 4,
    wins: 12,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Silver Mist",
    breed: "ARABIAN",
    age: 6,
    wins: 8,
    status: "INJURED",
  },
  {
    id: 3,
    name: "Midnight Ace",
    breed: "QUARTER HORSE",
    age: 5,
    wins: 15,
    status: "RETIRED",
  },
];
// THÊM VÀO NGOÀI COMPONENT APP:
const queryClient = new QueryClient();
function App() {
  const [currentPage, setCurrentPage] = useState("owner-races");
  const [horses, setHorses] = useState(INITIAL_HORSES);

  useEffect(() => {
    if (currentPage === "admin-dashboard") {
      window.history.pushState(null, '', '/admin');
    } else if (currentPage === "doctor-dashboard") {
      window.history.pushState(null, '', '/doctor');
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <DummyComponent title="Login / OTP" />;
      case "register":
        return <DummyComponent title="Register" />;
      case "spectator-home":
        return <DummyComponent title="Spectator Home" />;
      case "admin-dashboard":
        return <AdminApp />;
      case "doctor-dashboard":
        return <DoctorApp />;
      case "stable-management":
        return <DummyComponent title="Stable Management" />;
      case "owner-races":
        return <DummyComponent title="Owner Races" />;
      case "jockey-profile":
        return <DummyComponent title="Jockey Profile" />;
      case "referee-dashboard":
        return <DummyComponent title="Referee Dashboard" />;
      default:
        return <DummyComponent title="Login / OTP" />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {/* Dev navigation bar – remove in production */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          gap: 6,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          border: "1px solid #e2e8f0",
          borderRadius: "12px 12px 0 0",
          padding: "6px 14px",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#64748b",
            marginRight: 4,
          }}
        >
          DEV:
        </span>
        {PAGES.map((p) => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              background: currentPage === p ? "#1b60ec" : "#f1f5f9",
              color: currentPage === p ? "#fff" : "#475569",
              transition: "all 0.15s",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Page content */}
      <div
        className={`app-page-container ${currentPage === "spectator-home" || currentPage === "admin-dashboard" || currentPage === "doctor-dashboard" || currentPage === "stable-management" || currentPage === "owner-races" || currentPage === "jockey-profile" || currentPage === "referee-dashboard" ? "full-width" : ""}`}
        style={{
          paddingTop:
            currentPage === "spectator-home" ||
              currentPage === "admin-dashboard" ||
              currentPage === "doctor-dashboard" ||
              currentPage === "stable-management" ||
              currentPage === "owner-races" ||
              currentPage === "jockey-profile" ||
              currentPage === "referee-dashboard"
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
