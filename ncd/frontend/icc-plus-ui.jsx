import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Radio,
  Lock,
  User,
  Eye,
  EyeOff,
  ChevronRight,
  LayoutDashboard,
  Users,
  MapPin,
  Settings,
  Search,
  Bell,
  Plus,
  Wifi,
  WifiOff,
  MoreHorizontal,
  ClipboardCheck,
  Home,
  FolderSync,
  UserCircle2,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronLeft,
  Stethoscope,
  HeartPulse,
  FileText,
  Check,
} from "lucide-react";

/* ---------------------------------------------------------------
   TOKENS — pulled from the yrg mark: marigold disc, charcoal
   wordmark, single black dot. Warm paper ground instead of
   clinical white so the gold reads as warmth, not a highlighter.
----------------------------------------------------------------*/
const T = {
  charcoal900: "#242322",
  charcoal700: "#4A4844",
  charcoal500: "#7A776F",
  gold: "#F0B429",
  goldDeep: "#D89A1A",
  goldTint: "#FBEFD2",
  ink: "#121110",
  paper: "#FAF7F0",
  paperRaised: "#FFFFFF",
  line: "#E6DFCE",
  success: "#3C7A56",
  successTint: "#E6F0E7",
  error: "#B5473F",
  errorTint: "#F6E7E4",
};

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
`;

/* ---------------------------------------------------------------
   BRAND MARK — a small in-spirit rendering (not a trace of the
   uploaded file): lowercase wordmark + the black dot as a live
   "record" pulse.
----------------------------------------------------------------*/
function Mark({ dark = false, size = 22 }) {
  const word = dark ? T.paperRaised : T.charcoal900;
  return (
    <div className="flex items-center gap-2 select-none">
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: size,
          color: word,
          letterSpacing: "-0.02em",
        }}
      >
        icc<span style={{ color: T.gold }}>+</span>
      </span>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: T.ink,
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: size * 0.42,
          color: dark ? "#C9C6BC" : T.charcoal500,
          letterSpacing: "0.04em",
        }}
      >
        by yrg care
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------
   TOASTS
----------------------------------------------------------------*/
const TOAST_META = {
  success: { icon: CheckCircle2, color: T.success, tint: T.successTint, label: "Saved" },
  error: { icon: AlertCircle, color: T.error, tint: T.errorTint, label: "Something went wrong" },
  info: { icon: Info, color: T.charcoal700, tint: T.goldTint, label: "Note" },
};

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (type, title, body) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, type, title, body }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  return { toasts, push, dismiss };
}

function ToastStack({ toasts, dismiss }) {
  return (
    <div
      className="fixed top-5 right-5 z-50 flex flex-col gap-2"
      style={{ width: 340 }}
      aria-live="polite"
    >
      {toasts.map((t) => {
        const meta = TOAST_META[t.type];
        const Icon = meta.icon;
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-lg p-3.5 shadow-lg"
            style={{
              background: T.paperRaised,
              border: `1px solid ${T.line}`,
              boxShadow: "0 8px 24px rgba(36,35,34,0.14)",
              animation: "iccToastIn 220ms ease-out",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 28, height: 28, background: meta.tint }}
            >
              <Icon size={16} color={meta.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium leading-snug"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
              >
                {t.title || meta.label}
              </p>
              {t.body && (
                <p
                  className="text-xs mt-0.5 leading-snug"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal500 }}
                >
                  {t.body}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded p-0.5"
              style={{ color: T.charcoal500 }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes iccToastIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ---------------------------------------------------------------
   LANDING PAGE
----------------------------------------------------------------*/
function RecordTrail() {
  const stages = ["Captured in field", "Reviewed by DEO", "Verified by admin"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % stages.length), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}
    >
      <p
        className="text-xs mb-5 uppercase"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: T.charcoal500,
          letterSpacing: "0.08em",
        }}
      >
        record #A-10482 · live status
      </p>
      <div className="relative pl-1">
        <div
          className="absolute left-[9px] top-2 bottom-2 w-px"
          style={{ background: T.line }}
        />
        {stages.map((s, i) => {
          const done = i < active;
          const isActive = i === active;
          return (
            <div key={s} className="relative flex items-center gap-4 py-3">
              <span
                className="relative z-10 rounded-full shrink-0"
                style={{
                  width: 19,
                  height: 19,
                  background: done || isActive ? T.ink : T.paperRaised,
                  border: `2px solid ${done || isActive ? T.ink : T.line}`,
                  boxShadow: isActive ? `0 0 0 5px ${T.goldTint}` : "none",
                  transition: "box-shadow 400ms ease",
                }}
              />
              <span
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 14.5,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? T.ink : T.charcoal500,
                  transition: "color 300ms ease",
                }}
              >
                {s}
              </span>
              {isActive && (
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-[11px]"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: T.goldTint,
                    color: T.goldDeep,
                  }}
                >
                  now
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}
    >
      <div
        className="flex items-center justify-center rounded-lg mb-4"
        style={{ width: 36, height: 36, background: T.goldTint }}
      >
        <Icon size={18} color={T.goldDeep} />
      </div>
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: 16.5,
          color: T.ink,
        }}
      >
        {title}
      </h3>
      <p
        className="mt-1.5 leading-relaxed"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: T.charcoal500 }}
      >
        {body}
      </p>
    </div>
  );
}

function Landing({ goLogin, notify }) {
  return (
    <div style={{ background: T.paper, minHeight: "100%" }}>
      <nav
        className="flex items-center justify-between px-6 md:px-10 py-5"
        style={{ borderBottom: `1px solid ${T.line}` }}
      >
        <Mark />
        <button
          onClick={goLogin}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.ink, color: T.paperRaised }}
        >
          Sign in <ArrowRight size={14} />
        </button>
      </nav>

      <header className="px-6 md:px-10 pt-16 pb-14 max-w-5xl mx-auto">
        <span
          className="inline-block rounded-full px-3 py-1 text-xs mb-6"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            background: T.goldTint,
            color: T.goldDeep,
            letterSpacing: "0.03em",
          }}
        >
          integrated care coordination
        </span>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: "clamp(2.1rem, 4.5vw, 3.4rem)",
            color: T.ink,
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
            maxWidth: 720,
          }}
        >
          Every screening, tracked from the field to the file.
        </h1>
        <p
          className="mt-5 leading-relaxed"
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 16.5,
            color: T.charcoal700,
            maxWidth: 560,
          }}
        >
          ICC+ is how YRG CARE's data entry operators capture screenings offline
          and how admins verify, manage, and export them — one system, two
          portals, built for research-grade accuracy.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={goLogin}
            className="rounded-full px-5 py-3 text-sm font-medium flex items-center gap-2"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.gold, color: T.ink }}
          >
            Go to portal <ChevronRight size={15} />
          </button>
          <button
            onClick={() =>
              notify("info", "This is a demo", "Wire this up to your real docs link.")
            }
            className="rounded-full px-5 py-3 text-sm font-medium"
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              color: T.charcoal700,
              border: `1px solid ${T.line}`,
            }}
          >
            View documentation
          </button>
        </div>
      </header>

      <section className="px-6 md:px-10 pb-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
        <div className="grid gap-4">
          <FeatureCard
            icon={ClipboardList}
            title="Field-ready screening forms"
            body="DEOs capture vitals and history offline; records sync the moment a connection is back."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Role-based access"
            body="Admins and DEOs see only what their role needs — enforced at the API, not just the UI."
          />
          <FeatureCard
            icon={Radio}
            title="Live verification queue"
            body="Every submitted record moves through review to verified, with a full audit trail."
          />
        </div>
        <RecordTrail />
      </section>

      <footer
        className="px-6 md:px-10 py-8 flex items-center justify-between"
        style={{ borderTop: `1px solid ${T.line}` }}
      >
        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: T.charcoal500 }}
        >
          © {new Date().getFullYear()} YRG CARE · ICC+
        </span>
        <Mark size={15} />
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------
   LOGIN SCREEN
----------------------------------------------------------------*/
function Login({ goLanding, notify }) {
  const [role, setRole] = useState("admin");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Enter both your username and password to continue.");
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      notify(
        "success",
        "Signed in",
        role === "admin" ? "Redirecting to the admin dashboard." : "Redirecting to your screening queue."
      );
    }, 900);
  };

  return (
    <div className="grid md:grid-cols-2 min-h-full" style={{ background: T.paper }}>
      {/* Brand panel */}
      <div
        className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: T.charcoal900 }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 420,
            height: 420,
            background: T.gold,
            opacity: 0.16,
            right: -140,
            top: -140,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{ width: 10, height: 10, background: T.gold, right: 84, bottom: 120 }}
        />
        <button onClick={goLanding} className="relative z-10 self-start">
          <Mark dark />
        </button>
        <div className="relative z-10 max-w-sm">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 26,
              color: T.paperRaised,
              lineHeight: 1.25,
            }}
          >
            One record, verified at every step.
          </p>
          <p
            className="mt-3 leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: "#C9C6BC" }}
          >
            Sign in with the role assigned to you. Admins manage master data and
            approvals; data entry operators capture screenings in the field.
          </p>
        </div>
        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#8B887F" }}
          className="relative z-10"
        >
          v1 · api/v1/auth/login
        </span>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <form onSubmit={handleSubmit} className="w-full" style={{ maxWidth: 380 }}>
          <div className="md:hidden mb-8">
            <Mark />
          </div>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 24,
              color: T.ink,
            }}
          >
            Sign in
          </h2>
          <p
            className="mt-1 mb-6"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: T.charcoal500 }}
          >
            Choose your portal, then enter your credentials.
          </p>

          {/* Role toggle */}
          <div
            className="flex rounded-full p-1 mb-6"
            style={{ background: T.goldTint, width: "fit-content" }}
          >
            {[
              { id: "admin", label: "Admin" },
              { id: "deo", label: "Data entry" },
            ].map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setRole(r.id)}
                className="rounded-full px-4 py-1.5 text-xs font-medium"
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  background: role === r.id ? T.ink : "transparent",
                  color: role === r.id ? T.paperRaised : T.goldDeep,
                  transition: "all 180ms ease",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <label
            className="block text-xs font-medium mb-1.5"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal700 }}
          >
            Username
          </label>
          <div
            className="flex items-center gap-2 rounded-lg px-3 mb-4"
            style={{ border: `1px solid ${T.line}`, background: T.paperRaised }}
          >
            <User size={15} color={T.charcoal500} />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={role === "admin" ? "admin.chennai" : "deo.field01"}
              className="w-full py-2.5 text-sm outline-none bg-transparent"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
            />
          </div>

          <label
            className="block text-xs font-medium mb-1.5"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal700 }}
          >
            Password
          </label>
          <div
            className="flex items-center gap-2 rounded-lg px-3 mb-2"
            style={{ border: `1px solid ${T.line}`, background: T.paperRaised }}
          >
            <Lock size={15} color={T.charcoal500} />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className="w-full py-2.5 text-sm outline-none bg-transparent"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password visibility">
              {showPw ? (
                <EyeOff size={15} color={T.charcoal500} />
              ) : (
                <Eye size={15} color={T.charcoal500} />
              )}
            </button>
          </div>

          {error && (
            <p
              className="mb-2 text-xs"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.error }}
            >
              {error}
            </p>
          )}

          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={() => notify("info", "Check with your admin", "Password resets are issued by your ICC+ admin.")}
              className="text-xs"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal500 }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg py-3 text-sm font-medium flex items-center justify-center gap-2"
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              background: T.gold,
              color: T.ink,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={goLanding}
            className="w-full text-center mt-5 text-xs"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal500 }}
          >
            ← Back to overview
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   TOAST DEMO SCREEN
----------------------------------------------------------------*/
function ToastDemo({ notify }) {
  return (
    <div
      className="min-h-full flex items-center justify-center p-8"
      style={{ background: T.paper }}
    >
      <div
        className="rounded-2xl p-8 w-full"
        style={{ maxWidth: 480, background: T.paperRaised, border: `1px solid ${T.line}` }}
      >
        <Mark />
        <h2
          className="mt-6"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 21,
            color: T.ink,
          }}
        >
          Notification states
        </h2>
        <p
          className="mt-1 mb-6"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: T.charcoal500 }}
        >
          Every action in ICC+ confirms itself in the interface's own voice.
        </p>

        <div className="grid gap-2.5">
          <button
            onClick={() => notify("success", "Screening saved", "Record #A-10483 was added to the queue.")}
            className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.successTint, color: T.success }}
          >
            Trigger success <CheckCircle2 size={16} />
          </button>
          <button
            onClick={() => notify("error", "Couldn't submit record", "Check the connection and try again.")}
            className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.errorTint, color: T.error }}
          >
            Trigger error <AlertCircle size={16} />
          </button>
          <button
            onClick={() => notify("info", "Syncing in background", "12 records are waiting to sync.")}
            className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.goldTint, color: T.goldDeep }}
          >
            Trigger info <Info size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ADMIN DASHBOARD
----------------------------------------------------------------*/
const ADMIN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "queue", label: "Verification queue", icon: ClipboardCheck },
  { id: "locations", label: "Master data", icon: MapPin },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

const STAT_CARDS = [
  { label: "Total screened", value: "1,284", trend: "+6.4%" },
  { label: "Total eligible", value: "412", trend: "+18" },
  { label: "Total enrolled", value: "268", trend: "+9" },
  { label: "Pending verification", value: "37", trend: "−12" },
];

const LOCATIONS = ["All locations", "Perambur", "Anna Nagar", "T. Nagar", "Velachery"];
const SURVEYS = ["All surveys", "HIV risk screening", "NCD screening", "ART linkage follow-up"];

const QUEUE_ROWS = [
  { id: "A-10481", deo: "K. Priya", location: "Perambur", captured: "2h ago", status: "pending" },
  { id: "A-10482", deo: "R. Suresh", location: "Anna Nagar", captured: "3h ago", status: "pending" },
  { id: "A-10480", deo: "S. Meena", location: "T. Nagar", captured: "5h ago", status: "flagged" },
  { id: "A-10477", deo: "K. Priya", location: "Perambur", captured: "1d ago", status: "verified" },
];

const STATUS_META = {
  pending: { color: T.goldDeep, bg: T.goldTint, label: "Pending" },
  flagged: { color: T.error, bg: T.errorTint, label: "Flagged" },
  verified: { color: T.success, bg: T.successTint, label: "Verified" },
};

function StatusPill({ status }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.paperRaised, border: `1px solid ${T.line}`, color: T.charcoal700 }}
      >
        <Filter size={12} color={T.charcoal500} />
        {value || label}
        <ChevronDown size={12} color={T.charcoal500} />
      </button>
      {open && (
        <div
          className="absolute z-20 mt-1 rounded-lg overflow-hidden"
          style={{ background: T.paperRaised, border: `1px solid ${T.line}`, minWidth: 190, boxShadow: "0 8px 20px rgba(36,35,34,0.12)" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-xs"
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: opt === value ? T.ink : T.charcoal700,
                background: opt === value ? T.goldTint : "transparent",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ notify }) {
  const [active, setActive] = useState("dashboard");
  const [locationFilter, setLocationFilter] = useState(LOCATIONS[0]);
  const [surveyFilter, setSurveyFilter] = useState(SURVEYS[0]);

  return (
    <div className="flex min-h-full" style={{ background: T.paper }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 p-4"
        style={{ background: T.charcoal900 }}
      >
        <div className="px-2 py-2 mb-6">
          <Mark dark size={19} />
        </div>
        <nav className="flex flex-col gap-1">
          {ADMIN_NAV.map((n) => {
            const Icon = n.icon;
            const isActive = active === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-left"
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  background: isActive ? T.gold : "transparent",
                  color: isActive ? T.ink : "#C9C6BC",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <Icon size={16} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-3 py-3 rounded-lg" style={{ background: "#2F2E2C" }}>
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{ width: 30, height: 30, background: T.gold, color: T.ink, fontWeight: 600, fontSize: 12, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            AD
          </div>
          <div className="min-w-0">
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: T.paperRaised, fontWeight: 500 }}>admin.chennai</p>
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: "#8B887F" }}>Administrator</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header
          className="flex items-center justify-between gap-4 px-6 py-4"
          style={{ borderBottom: `1px solid ${T.line}`, background: T.paperRaised }}
        >
          <div className="md:hidden"><Mark size={18} /></div>
          <div
            className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2 flex-1"
            style={{ background: T.paper, border: `1px solid ${T.line}`, maxWidth: 340 }}
          >
            <Search size={15} color={T.charcoal500} />
            <input
              placeholder="Search records, DEOs, locations…"
              className="w-full text-sm outline-none bg-transparent"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
            />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => notify("info", "3 new records", "Submitted in the last hour.")} className="relative">
              <Bell size={18} color={T.charcoal700} />
              <span className="absolute -top-1 -right-1 rounded-full" style={{ width: 8, height: 8, background: T.error }} />
            </button>
            <div
              className="rounded-full flex items-center justify-center md:hidden"
              style={{ width: 30, height: 30, background: T.goldTint, color: T.goldDeep, fontWeight: 600, fontSize: 12, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              AD
            </div>
          </div>
        </header>

        <main className="p-6">
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, color: T.ink }}>
            Good morning, Admin
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: T.charcoal500 }} className="mt-1">
            Here's what came in from the field since yesterday.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {STAT_CARDS.map((s) => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
                <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: T.charcoal500 }}>{s.label}</p>
                <div className="flex items-end justify-between mt-2">
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, color: T.ink }}>{s.value}</span>
                  <span className="flex items-center gap-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.success }}>
                    <TrendingUp size={11} /> {s.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 mb-3">
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: T.ink }}>
              Recent screenings
            </h2>
            <div className="flex items-center gap-2">
              <FilterDropdown label="Location" options={LOCATIONS} value={locationFilter} onChange={(v) => { setLocationFilter(v); notify("info", "Filter applied", `Showing records for ${v}.`); }} />
              <FilterDropdown label="Survey" options={SURVEYS} value={surveyFilter} onChange={(v) => { setSurveyFilter(v); notify("info", "Filter applied", `Showing ${v}.`); }} />
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.line}` }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.charcoal500 }}>
                {QUEUE_ROWS.length} records · filtered by {locationFilter} / {surveyFilter}
              </span>
              <button
                onClick={() => notify("success", "Queue refreshed")}
                style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: T.goldDeep }}
              >
                Refresh
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.charcoal500 }}>
                  <th className="font-normal px-5 py-2.5">Record</th>
                  <th className="font-normal px-5 py-2.5 hidden sm:table-cell">DEO</th>
                  <th className="font-normal px-5 py-2.5 hidden md:table-cell">Location</th>
                  <th className="font-normal px-5 py-2.5">Captured</th>
                  <th className="font-normal px-5 py-2.5">Status</th>
                  <th className="font-normal px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {QUEUE_ROWS.map((r) => (
                  <tr key={r.id} style={{ borderTop: `1px solid ${T.line}` }}>
                    <td className="px-5 py-3" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: T.ink }}>{r.id}</td>
                    <td className="px-5 py-3 hidden sm:table-cell" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: T.charcoal700 }}>{r.deo}</td>
                    <td className="px-5 py-3 hidden md:table-cell" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: T.charcoal700 }}>{r.location}</td>
                    <td className="px-5 py-3" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: T.charcoal500 }}>{r.captured}</td>
                    <td className="px-5 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          r.status === "verified"
                            ? notify("info", "Already verified")
                            : notify("success", `${r.id} verified`, "Moved to the verified archive.")
                        }
                        style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: T.goldDeep, fontWeight: 500 }}
                      >
                        {r.status === "verified" ? <MoreHorizontal size={15} /> : "Verify"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   CLIENT (DEO) DASHBOARD — mobile-first
----------------------------------------------------------------*/
const QUEUE_TABS = [
  { id: "pending", label: "Pending screening" },
  { id: "eligible", label: "Eligible" },
  { id: "enrolled", label: "Enrolled" },
];

const QUEUE_DATA = {
  pending: [
    { name: "Muthu Kumar", id: "S-2291", meta: "Not yet screened", cta: "Start survey" },
    { name: "Ravi Shankar", id: "S-2294", meta: "Draft saved · 40% complete", cta: "Resume survey" },
    { name: "Divya N.", id: "S-2296", meta: "Not yet screened", cta: "Start survey" },
  ],
  eligible: [
    { name: "Lakshmi R.", id: "S-2292", meta: "Eligible · awaiting enrollment", cta: "Enroll now" },
    { name: "Anitha V.", id: "S-2293", meta: "Eligible · awaiting enrollment", cta: "Enroll now" },
  ],
  enrolled: [
    { name: "Suresh Babu", id: "S-2280", meta: "Enrolled · awaiting ART linkage", cta: "Update form" },
    { name: "Kavya S.", id: "S-2277", meta: "Enrolled · awaiting ART linkage", cta: "Update form" },
  ],
};

function ClientDashboard({ notify, openSurvey }) {
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState("pending");
  const rows = QUEUE_DATA[tab];

  return (
    <div className="flex flex-col min-h-full" style={{ background: T.paper }}>
      <header
        className="flex items-center justify-between px-5 py-4"
        style={{ background: T.paperRaised, borderBottom: `1px solid ${T.line}` }}
      >
        <div>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: T.charcoal500 }}>Good morning</p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17, color: T.ink }}>K. Priya</p>
        </div>
        <button
          onClick={() => {
            setOnline((o) => !o);
            notify(online ? "error" : "success", online ? "You're offline" : "Back online", online ? "Records will queue locally and sync later." : "Syncing 3 queued records now.");
          }}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            background: online ? T.successTint : T.errorTint,
            color: online ? T.success : T.error,
          }}
        >
          {online ? <Wifi size={13} /> : <WifiOff size={13} />}
          {online ? "Online" : "Offline"}
        </button>
      </header>

      {/* Queue tabs */}
      <div className="flex gap-1 px-5 pt-4">
        {QUEUE_TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="rounded-full px-3.5 py-2 text-xs font-medium flex items-center gap-1.5"
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                background: isActive ? T.ink : T.paperRaised,
                color: isActive ? T.paperRaised : T.charcoal700,
                border: `1px solid ${isActive ? T.ink : T.line}`,
              }}
            >
              {t.label}
              <span
                className="rounded-full px-1.5 text-[10px]"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  background: isActive ? T.gold : T.goldTint,
                  color: T.goldDeep,
                }}
              >
                {QUEUE_DATA[t.id].length}
              </span>
            </button>
          );
        })}
      </div>

      <main className="flex-1 p-5 pb-24">
        <div className="grid gap-3">
          {rows.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-xl p-3.5"
              style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}
            >
              <div
                className="rounded-full flex items-center justify-center shrink-0"
                style={{ width: 38, height: 38, background: T.goldTint, color: T.goldDeep, fontWeight: 600, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, fontWeight: 500, color: T.ink }}>{s.name}</p>
                <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11.5, color: T.charcoal500 }}>{s.id} · {s.meta}</p>
              </div>
              <button
                onClick={() => openSurvey(s)}
                className="shrink-0 rounded-full px-3.5 py-2 text-xs font-medium"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.gold, color: T.ink }}
              >
                {s.cta}
              </button>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-center py-10" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: T.charcoal500 }}>
              Nothing in this queue right now.
            </p>
          )}
        </div>
      </main>

      {/* Floating action */}
      <button
        onClick={() => openSurvey({ name: "New participant", id: "S-new" })}
        className="fixed rounded-full flex items-center justify-center shadow-lg"
        style={{ width: 52, height: 52, background: T.gold, color: T.ink, right: 20, bottom: 84 }}
      >
        <Plus size={22} />
      </button>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-2.5"
        style={{ background: T.paperRaised, borderTop: `1px solid ${T.line}` }}
      >
        {[
          { id: "queue", label: "Queue", icon: Home },
          { id: "sync", label: "Sync", icon: FolderSync },
          { id: "verified", label: "Verified", icon: ClipboardCheck },
          { id: "profile", label: "Profile", icon: UserCircle2 },
        ].map((n) => {
          const Icon = n.icon;
          const isActive = n.id === "queue";
          return (
            <button key={n.id} onClick={() => n.id === "queue" ? null : notify("info", n.label)} className="flex flex-col items-center gap-1 px-3">
              <Icon size={19} color={isActive ? T.ink : T.charcoal500} />
              <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10.5, color: isActive ? T.ink : T.charcoal500, fontWeight: isActive ? 600 : 400 }}>
                {n.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ---------------------------------------------------------------
   SURVEY / SCREENING FORM — stepper wizard
----------------------------------------------------------------*/
const SURVEY_STEPS = [
  { id: "demographics", label: "Demographics", icon: FileText },
  { id: "vitals", label: "Vitals", icon: HeartPulse },
  { id: "status", label: "HIV / NCD status", icon: Stethoscope },
];

function FieldLabel({ children }) {
  return (
    <label
      className="block text-xs font-medium mb-1.5"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal700 }}
    >
      {children}
    </label>
  );
}

function TextField({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif", border: `1px solid ${T.line}`, background: T.paperRaised, color: T.ink }}
      />
    </div>
  );
}

function RadioField({ label, options, value, onChange }) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            className="flex-1 rounded-lg py-2.5 text-sm font-medium"
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              border: `1px solid ${value === opt ? T.ink : T.line}`,
              background: value === opt ? T.ink : T.paperRaised,
              color: value === opt ? T.paperRaised : T.charcoal700,
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectField({ label, options, value, onChange }) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif", border: `1px solid ${T.line}`, background: T.paperRaised, color: T.ink }}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function SurveyForm({ participant, onCancel, onSubmit, notify }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    fullName: participant?.name && participant.name !== "New participant" ? participant.name : "",
    age: "",
    gender: "",
    location: "",
    bp: "",
    weight: "",
    temp: "",
    eligible: "",
    enrollmentDate: "",
    ncdFlag: "",
  });
  const set = (k) => (v) => setData((d) => ({ ...d, [k]: v }));

  const isLast = step === SURVEY_STEPS.length - 1;

  const next = () => {
    if (step === 0 && !data.fullName) {
      notify("error", "Name required", "Enter the participant's full name to continue.");
      return;
    }
    if (isLast) {
      notify("success", "Screening submitted", `${data.fullName || "Record"} saved to the queue for review.`);
      onSubmit();
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="min-h-full flex flex-col" style={{ background: T.paper }}>
      <header
        className="flex items-center gap-3 px-5 py-4"
        style={{ background: T.paperRaised, borderBottom: `1px solid ${T.line}` }}
      >
        <button onClick={onCancel} className="rounded-full p-1.5" style={{ background: T.paper }}>
          <ChevronLeft size={17} color={T.charcoal700} />
        </button>
        <div>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: T.ink }}>
            {participant?.id === "S-new" ? "New screening" : `Screening · ${participant?.id}`}
          </p>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11.5, color: T.charcoal500 }}>
            {participant?.name}
          </p>
        </div>
      </header>

      {/* Stepper */}
      <div className="flex items-center gap-2 px-5 py-4">
        {SURVEY_STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const isActive = i === step;
          return (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <div
                  className="rounded-full flex items-center justify-center shrink-0"
                  style={{
                    width: 28,
                    height: 28,
                    background: done ? T.success : isActive ? T.ink : T.paperRaised,
                    border: `1px solid ${done ? T.success : isActive ? T.ink : T.line}`,
                  }}
                >
                  {done ? <Check size={14} color="#fff" /> : <Icon size={13} color={isActive ? T.paperRaised : T.charcoal500} />}
                </div>
                <span
                  className="hidden sm:inline"
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 12.5,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? T.ink : T.charcoal500,
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < SURVEY_STEPS.length - 1 && (
                <div className="flex-1 h-px" style={{ background: done ? T.success : T.line }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <main className="flex-1 px-5 pb-28">
        <div className="rounded-xl p-5" style={{ background: T.paperRaised, border: `1px solid ${T.line}`, maxWidth: 480 }}>
          {step === 0 && (
            <>
              <TextField label="Full name" placeholder="e.g. Muthu Kumar" value={data.fullName} onChange={set("fullName")} />
              <TextField label="Age" placeholder="e.g. 34" type="number" value={data.age} onChange={set("age")} />
              <RadioField label="Gender" options={["Male", "Female", "Other"]} value={data.gender} onChange={set("gender")} />
              <SelectField label="Location" options={LOCATIONS.slice(1)} value={data.location} onChange={set("location")} />
            </>
          )}
          {step === 1 && (
            <>
              <TextField label="Blood pressure" placeholder="e.g. 120/80" value={data.bp} onChange={set("bp")} />
              <TextField label="Weight (kg)" placeholder="e.g. 62" type="number" value={data.weight} onChange={set("weight")} />
              <TextField label="Temperature (°F)" placeholder="e.g. 98.6" type="number" value={data.temp} onChange={set("temp")} />
            </>
          )}
          {step === 2 && (
            <>
              <RadioField label="Eligible for enrollment?" options={["Yes", "No"]} value={data.eligible} onChange={set("eligible")} />
              {data.eligible === "Yes" && (
                <TextField label="Date of enrollment" type="date" value={data.enrollmentDate} onChange={set("enrollmentDate")} />
              )}
              <RadioField label="NCD risk flag?" options={["Yes", "No"]} value={data.ncdFlag} onChange={set("ncdFlag")} />
            </>
          )}
        </div>
      </main>

      {/* Footer nav */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-5 py-4"
        style={{ background: T.paperRaised, borderTop: `1px solid ${T.line}` }}
      >
        <button
          onClick={() => (step === 0 ? onCancel() : setStep((s) => s - 1))}
          className="rounded-full px-4 py-2.5 text-sm font-medium"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal700, border: `1px solid ${T.line}` }}
        >
          {step === 0 ? "Cancel" : "Back"}
        </button>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.charcoal500 }}>
          Step {step + 1} of {SURVEY_STEPS.length}
        </span>
        <button
          onClick={next}
          className="rounded-full px-5 py-2.5 text-sm font-medium"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.gold, color: T.ink }}
        >
          {isLast ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   APP SHELL
----------------------------------------------------------------*/
export default function App() {
  const [view, setView] = useState("landing");
  const [activeParticipant, setActiveParticipant] = useState(null);
  const { toasts, push, dismiss } = useToasts();

  const openSurvey = (participant) => {
    setActiveParticipant(participant);
    setView("survey");
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{fontImport}</style>

      {/* Screen switcher — dev-facing, not part of the product itself */}
      <div
        className="flex items-center gap-1 px-4 py-2 text-xs"
        style={{ background: T.ink, borderBottom: `1px solid ${T.charcoal700}` }}
      >
        {[
          { id: "landing", label: "Landing" },
          { id: "login", label: "Login" },
          { id: "admin", label: "Admin dashboard" },
          { id: "client", label: "Client dashboard" },
          { id: "toast", label: "Toasts" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className="rounded-full px-3 py-1"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              background: view === v.id ? T.gold : "transparent",
              color: view === v.id ? T.ink : "#C9C6BC",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 620 }}>
        {view === "landing" && (
          <Landing goLogin={() => setView("login")} notify={push} />
        )}
        {view === "login" && (
          <Login goLanding={() => setView("landing")} notify={push} />
        )}
        {view === "admin" && <AdminDashboard notify={push} />}
        {view === "client" && <ClientDashboard notify={push} openSurvey={openSurvey} />}
        {view === "survey" && (
          <SurveyForm
            participant={activeParticipant}
            notify={push}
            onCancel={() => setView("client")}
            onSubmit={() => setView("client")}
          />
        )}
        {view === "toast" && <ToastDemo notify={push} />}
      </div>

      <ToastStack toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
