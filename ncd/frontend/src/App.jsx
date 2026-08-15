import React, { useState, useEffect, Component } from "react";
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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('ncd_token');
    localStorage.removeItem('ncd_user');
    localStorage.removeItem('icc_token');
    localStorage.removeItem('icc_user');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF9F6] p-6 text-slate-900 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-extrabold text-lg">
              !
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Application Session Reset</h2>
            <div className="p-3 bg-red-50 text-red-700 text-xs font-mono rounded-xl text-left border border-red-200 overflow-x-auto max-h-40">
              <strong>Error Details:</strong> {this.state.error ? this.state.error.toString() : "Unknown Error"}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              An unexpected session error occurred. Click below to clear stored session data and reload cleanly.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function MainApp() {
  const [view, setView] = useState(() => {
    try {
      const token = localStorage.getItem('ncd_token') || localStorage.getItem('icc_token');
      const userStr = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
      if (token && userStr && userStr !== 'undefined' && userStr !== 'null') {
        const user = JSON.parse(userStr);
        if (user && typeof user === 'object') {
          if (user.role_id === 1 || user.role_id === '1') {
            return "admin";
          }
          return "client";
        }
      }
    } catch (e) {
      console.error("Auth check error", e);
    }
    return "landing";
  });

  const [activeParticipant, setActiveParticipant] = useState(null);
  const { push } = useToasts();

  const handleLoginSuccess = (token, user) => {
    if (user && (user.role_id === 1 || user.role_id === '1')) {
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
    <ErrorBoundary>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ErrorBoundary>
  );
}
