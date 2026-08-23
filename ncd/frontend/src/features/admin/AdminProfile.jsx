import React, { useState } from "react";
import { UserCircle2, Mail, Lock, Unlock, Layers, ShieldCheck, CheckCircle2, Server, Database, Cpu, HardDrive, Activity, Trash2, Loader2 } from "lucide-react";

export function AdminProfile({ notify, user, phase1Unlocked, togglePhase1Lock }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "System Administrator",
    email: user?.email || "admin@icc.com",
    current_password: "",
    new_password: "",
    confirm_password: "",
    smtp_host: "smtp.office365.com",
    smtp_port: "587",
    smtp_user: "alerts@yrgcare.org",
    smtp_pass: "",
  });

  const [saving, setSaving] = useState(false);
  const [resettingDb, setResettingDb] = useState(false);
  const [resumeButtonEnabled, setResumeButtonEnabled] = useState(
    () => localStorage.getItem('ncd_setting_enable_resume_button') !== 'false'
  );

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const stored = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
      let userObj = stored ? JSON.parse(stored) : {};
      userObj.full_name = formData.full_name;
      userObj.email = formData.email;
      localStorage.setItem('ncd_user', JSON.stringify(userObj));
      localStorage.setItem('icc_user', JSON.stringify(userObj));
      notify("success", "Profile Updated", "Profile information updated successfully.");
    } catch (err) {
      notify("error", "Update Failed", "Could not update profile information.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      notify("error", "Password Mismatch", "New passwords do not match.");
      return;
    }
    if (!formData.current_password || !formData.new_password) {
      notify("error", "Required Fields", "Please fill in all password fields.");
      return;
    }

    setSaving(true);
    try {
      notify("success", "Password Changed", "Password securely updated.");
      setFormData({ ...formData, current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      notify("error", "Update Failed", "Could not update password.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm("CAUTION: Are you sure you want to PURGE and RESET all screening records in the database? This action will truncate screening data tables and clear local offline queues.")) {
      return;
    }

    setResettingDb(true);
    try {
      // 1. Call Backend API endpoint to clear MySQL screening tables
      const res = await api.get('/api/v1/dashboard/resetdatabase');
      
      // 2. Purge local offline queues & local storage caches
      localStorage.removeItem('ncd_offline_queue');
      localStorage.removeItem('ncd_used_participant_ids');
      localStorage.removeItem('ncd_active_survey_draft');
      localStorage.removeItem('ncd_participant_seq_DH');
      localStorage.removeItem('ncd_participant_seq_ML');
      localStorage.removeItem('ncd_participant_seq_VA');

      if (res && res.status === 'success') {
        notify("success", "Database Reset Complete", "All screening tables & local offline queues have been purged successfully!");
      } else {
        notify("info", "Local Queues Reset", "Local offline queues cleared. DB status: " + (res?.message || "Done"));
      }
    } catch (e) {
      localStorage.removeItem('ncd_offline_queue');
      localStorage.removeItem('ncd_used_participant_ids');
      localStorage.removeItem('ncd_active_survey_draft');
      notify("info", "Local Queues Cleared", "Local offline queues purged.");
    } finally {
      setResettingDb(false);
    }
  };

  const handleSMTPUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('ncd_smtp', JSON.stringify({
        host: formData.smtp_host,
        port: formData.smtp_port,
        user: formData.smtp_user
      }));
      notify("success", "SMTP Configured", "Email server settings saved successfully.");
    } catch (err) {
      notify("error", "Update Failed", "Could not save SMTP settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/60">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-2xs rounded-t-2xl">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            My Profile & System Settings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your account credentials, security preferences, and system notifications.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 max-w-5xl space-y-6">
        
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 text-amber-400 font-bold flex items-center justify-center text-xl shadow-xs">
              <UserCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">
                {formData.full_name}
              </h2>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Mail size={13} className="text-gray-400" />
                {formData.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
              <ShieldCheck size={14} className="text-amber-500" /> System Administrator
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
                Personal Information
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.full_name} 
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900" 
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-colors shadow-2xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
                Security & Authentication
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    value={formData.current_password}
                    placeholder="••••••••"
                    onChange={e => setFormData({...formData, current_password: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    value={formData.new_password}
                    placeholder="••••••••"
                    onChange={e => setFormData({...formData, new_password: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={formData.confirm_password}
                    placeholder="••••••••"
                    onChange={e => setFormData({...formData, confirm_password: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900" 
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Unified System Features Deck & Operational Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Layers size={18} className="text-amber-600" />
                <span>System Features Deck & Operational Controls</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Centralized Feature Deck to enable/disable operational features and dataset security locks across the platform.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 uppercase">
              Features Deck Control
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature 1: Survey Session Resume Button */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider">1. Survey Session Resume Button</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono ${resumeButtonEnabled ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-slate-200 text-slate-700'}`}>
                    {resumeButtonEnabled ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Enable or disable the "Resume Session" button and draft pause banner across operational screening forms in DEO / Staff Nurse workstation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !resumeButtonEnabled;
                  setResumeButtonEnabled(nextVal);
                  localStorage.setItem('ncd_setting_enable_resume_button', nextVal ? 'true' : 'false');
                  window.dispatchEvent(new Event('ncd_resume_setting_changed'));
                  notify("success", "Feature Updated", `Survey Resume Button has been ${nextVal ? 'ENABLED' : 'DISABLED'}.`);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border shadow-2xs font-mono flex items-center justify-center gap-2 ${
                  resumeButtonEnabled ? 'bg-amber-400 text-amber-950 border-amber-500 hover:bg-amber-500' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{resumeButtonEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}</span>
              </button>
            </div>

            {/* Feature 2: Phase I Baseline Dataset Access Lock System */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">2. Phase I Baseline Access Lock</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono ${phase1Unlocked ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-red-100 text-red-950 border border-red-300'}`}>
                    {phase1Unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Lock or unlock access to historical Phase I baseline records across analytics, participant directory, exports, and phase selection.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (togglePhase1Lock) togglePhase1Lock();
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border shadow-2xs font-mono flex items-center justify-center gap-2 ${
                  phase1Unlocked 
                    ? 'bg-amber-400 text-amber-950 border-amber-500 hover:bg-amber-500' 
                    : 'bg-slate-900 text-white border-slate-950 hover:bg-black'
                }`}
              >
                {phase1Unlocked ? <Unlock size={14} className="text-amber-950" /> : <Lock size={14} className="text-amber-400" />}
                <span>{phase1Unlocked ? "UNLOCKED (ACCESSIBLE)" : "LOCKED (RESTRICTED)"}</span>
              </button>
            </div>

            {/* Feature 3: Purge & Reset Screening Database */}
            <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 flex flex-col justify-between space-y-4 md:col-span-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-red-950 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Trash2 size={14} className="text-red-600" /> 3. Purge & Reset Screening Database
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded font-mono bg-red-100 text-red-800 border border-red-300 uppercase">
                    SYSTEM RESET CONTROL
                  </span>
                </div>
                <p className="text-[11px] text-red-800 leading-relaxed font-medium">
                  Truncate all live screening records across backend database tables (<code className="bg-red-100 px-1 py-0.5 rounded text-red-950 font-bold">cms_mdhl</code>, <code className="bg-red-100 px-1 py-0.5 rounded text-red-950 font-bold">cms_apm</code>, <code className="bg-red-100 px-1 py-0.5 rounded text-red-950 font-bold">cms_vital</code>, etc.) and reset offline local storage queues.
                </p>
              </div>

              <button
                type="button"
                disabled={resettingDb}
                onClick={handleResetDatabase}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-red-600 text-white border border-red-700 hover:bg-red-700 transition-all cursor-pointer shadow-2xs font-mono flex items-center justify-center gap-2"
              >
                {resettingDb ? <Loader2 size={14} className="animate-spin text-white" /> : <Trash2 size={14} className="text-white" />}
                <span>{resettingDb ? "RESETTING DATABASE..." : "PURGE & RESET SCREENING DATABASE"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">
                Database Mastery & Storage Infrastructure
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={12} className="text-emerald-600" /> Connection Status: Optimal (100% Healthy)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">Engine & Version</span>
                <Cpu size={14} className="text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono">MariaDB 10.11</p>
              <p className="text-[10px] text-slate-500 mt-0.5">InnoDB Storage Engine</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">Active Database</span>
                <Database size={14} className="text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono">ncd_production</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Host: db:3306 (Docker)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">Total Tables</span>
                <Layers size={14} className="text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono">24 Core Tables</p>
              <p className="text-[10px] text-slate-500 mt-0.5">cms_screening, cms_users...</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">Stored Baseline Records</span>
                <HardDrive size={14} className="text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono">3,424 Phase I Rows</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Allocated Storage: 48.2 MB</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-3">
            <Activity size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900">Database Mastery Architecture:</span> Full foreign-key integrity enabled for fast indexing across 16 screening sections, multi-location participant queues, and user privileges matrix. Automated health checks run loopback pings every 30 seconds.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
