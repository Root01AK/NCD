import React, { useState, useEffect } from "react";
import { Landing } from "./features/auth/Landing";
import { Login } from "./features/auth/Login";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { ClientDashboard } from "./features/client/ClientDashboard";
import { DynamicSurveyForm } from "./features/client/DynamicSurveyForm";
import { ToastProvider, useToasts } from "./components/ui/ToastProvider";
import { T } from "./lib/theme";

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
`;

function MainApp() {
  const [view, setView] = useState("landing");
  const [activeParticipant, setActiveParticipant] = useState(null);
  const { push } = useToasts();
  
  // Check auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('ncd_token') || localStorage.getItem('icc_token');
    const userStr = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Automatically route based on role_id
        // Assuming role_id 1 is admin, others are DEO/Client
        if (user.role_id === 1) {
          setView("admin");
        } else {
          setView("client");
        }
      } catch (e) {
        // Invalid stored user
        localStorage.removeItem('ncd_token');
        localStorage.removeItem('ncd_user');
        localStorage.removeItem('icc_token');
        localStorage.removeItem('icc_user');
      }
    }
  }, []);

  const handleLoginSuccess = (token, user) => {
    if (user.role_id === 1) {
      setView("admin");
    } else {
      setView("client");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ncd_token');
    localStorage.removeItem('ncd_user');
    localStorage.removeItem('icc_token');
    localStorage.removeItem('icc_user');
    setView("landing");
    push("info", "Signed out", "You have been successfully signed out.");
  };

  const openSurvey = (participant) => {
    setActiveParticipant(participant);
    setView("survey");
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{fontImport}</style>



      <div style={{ minHeight: '100vh' }}>
        {view === "landing" && (
          <Landing goLogin={() => setView("login")} notify={push} />
        )}
        {view === "login" && (
          <Login goLanding={() => setView("landing")} notify={push} onLoginSuccess={handleLoginSuccess} />
        )}
        {view === "admin" && <AdminDashboard notify={push} logout={handleLogout} />}
        {view === "client" && <ClientDashboard notify={push} openSurvey={openSurvey} logout={handleLogout} />}
        {view === "survey" && (
          <DynamicSurveyForm
            participant={activeParticipant}
            notify={push}
            onCancel={() => setView("client")}
            onSubmit={() => setView("client")}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
