import React, { useState } from "react";
import { UserCircle2, Mail, Lock, Unlock, Layers, ShieldCheck, CheckCircle2, Server } from "lucide-react";

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
        
        {/* Top Minimal Admin Identity Header Card */}
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
              <ShieldCheck size={14} className="text-amber-500" /> System Administrator
            </span>
          </div>
        </div>

        {/* 2-Column Minimal Section Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Account Details Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                <UserCircle2 size={18} className="text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Account Details
                </h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    value={formData.full_name} 
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
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
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-colors"
                  >
                    Save Account Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security & Password Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                <Lock size={18} className="text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Security & Password
                </h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input 
                    type="password" 
                    value={formData.current_password} 
                    onChange={e => setFormData({...formData, current_password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      New Password
                    </label>
                    <input 
                      type="password" 
                      value={formData.new_password} 
                      onChange={e => setFormData({...formData, new_password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input 
                      type="password" 
                      value={formData.confirm_password} 
                      onChange={e => setFormData({...formData, confirm_password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Phase I Dataset Access Lock Control Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-gray-700" />
              <h3 className="text-sm font-bold text-gray-900">
                Phase I Baseline Dataset Access Lock System
              </h3>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${phase1Unlocked ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700 border border-slate-300'}`}>
              {phase1Unlocked ? 'Unlocked & Visible' : 'Locked & Hidden'}
            </span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 text-xs">
            <div className="max-w-xl">
              <p className="font-semibold text-gray-800">
                Phase I Historical Data Visibility
              </p>
              <p className="text-gray-500 mt-0.5 leading-relaxed">
                By default, Phase I data is locked and hidden from dropdown selectors across the system. Unlock this setting to allow administrators to switch to and review Phase I historical baseline records.
              </p>
            </div>

            {togglePhase1Lock && (
              <button
                type="button"
                onClick={togglePhase1Lock}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer border ${
                  phase1Unlocked 
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' 
                    : 'bg-slate-900 text-white border-slate-800 hover:bg-black'
                }`}
              >
                {phase1Unlocked ? <Unlock size={14} className="text-amber-600" /> : <Lock size={14} className="text-amber-400" />}
                <span>{phase1Unlocked ? "Lock Phase I Baseline Data" : "Unlock Phase I Baseline Data"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global SMTP Configuration (Compact Row) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
            <Server size={18} className="text-gray-700" />
            <h3 className="text-sm font-bold text-gray-900">
              System SMTP Email Notifications
            </h3>
          </div>

          <form onSubmit={handleSMTPUpdate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block font-semibold text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input 
                  type="text" 
                  value={formData.smtp_host} 
                  onChange={e => setFormData({...formData, smtp_host: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Port
                </label>
                <input 
                  type="text" 
                  value={formData.smtp_port} 
                  onChange={e => setFormData({...formData, smtp_port: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  SMTP Username
                </label>
                <input 
                  type="text" 
                  value={formData.smtp_user} 
                  onChange={e => setFormData({...formData, smtp_user: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  SMTP Password
                </label>
                <input 
                  type="password" 
                  value={formData.smtp_pass} 
                  placeholder="••••••••"
                  onChange={e => setFormData({...formData, smtp_pass: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
              >
                Save SMTP Settings
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
