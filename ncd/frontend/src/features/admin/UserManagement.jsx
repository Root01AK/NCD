import React, { useState, useEffect } from "react";
import { Plus, Search, UserCircle2, Edit2, Trash2, ShieldCheck, Mail, ShieldAlert, X, Loader2, Layers, CheckCircle2, Check, RefreshCw, ChevronDown, ChevronUp, Lock, Menu, Building2, MapPin } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";

export const SCREENING_MODULES = [
  { id: 1, title: "Demographics", defaultRoleKey: "field_supervisor", roleLabel: "Field Supervisor" },
  { id: 2, title: "Medical History", defaultRoleKey: "staff_nurse", roleLabel: "Staff Nurse" },
  { id: 3, title: "Tobacco Use", defaultRoleKey: "staff_nurse", roleLabel: "Staff Nurse" },
  { id: 4, title: "Alcohol Use", defaultRoleKey: "staff_nurse", roleLabel: "Staff Nurse" },
  { id: 5, title: "Other Substance Use", defaultRoleKey: "staff_nurse", roleLabel: "Staff Nurse" },
  { id: 6, title: "Diet and Physical Activity", defaultRoleKey: "staff_nurse", roleLabel: "Staff Nurse" },
  { id: 7, title: "Symptom Screening", defaultRoleKey: "staff_nurse", roleLabel: "Staff Nurse" },
  { id: 8, title: "Mental Health Screening", defaultRoleKey: "counselor", roleLabel: "Staff Nurse or Counselor" },
  { id: 9, title: "Anthropometry", defaultRoleKey: "staff_nurse", roleLabel: "Staff Nurse" },
  { id: 10, title: "Vitals", defaultRoleKey: "staff_nurse", roleLabel: "Staff Nurse" },
  { id: 11, title: "Point-of-Care Tests", defaultRoleKey: "staff_nurse", roleLabel: "Staff Nurse" },
  { id: 12, title: "Clinical Examinations", defaultRoleKey: "doctor", roleLabel: "Doctor" },
  { id: 13, title: "Risk Categorisation and Referral", defaultRoleKey: "doctor", roleLabel: "Doctor" },
  { id: 14, title: "Linkages and Follow-up Tracking", defaultRoleKey: "case_management_coordinator", roleLabel: "Case Management Coordinator" },
  { id: 15, title: "Health Counseling", defaultRoleKey: "counselor", roleLabel: "Counselor" },
  { id: 16, title: "Community Perception", defaultRoleKey: "field_supervisor", roleLabel: "Field Supervisor" }
];

export const getDefaultModulesForRole = (roleKey) => {
  switch (roleKey) {
    case "field_supervisor":
      return [1, 16];
    case "staff_nurse":
      return [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    case "counselor":
      return [8, 15];
    case "doctor":
      return [12, 13];
    case "case_management_coordinator":
      return [14];
    case "admin":
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    case "deo":
    default:
      return [1, 16];
  }
};

export const ROLE_CONFIGS = {
  admin: { label: "System Administrator", className: "bg-amber-50 text-amber-900 border-amber-300 rounded-full" },
  field_supervisor: { label: "Field Supervisor", className: "bg-blue-50 text-blue-700 border-blue-200 rounded-full" },
  staff_nurse: { label: "Staff Nurse", className: "bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full" },
  counselor: { label: "Counselor", className: "bg-pink-50 text-pink-700 border-pink-200 rounded-full" },
  doctor: { label: "Doctor", className: "bg-purple-50 text-purple-700 border-purple-200 rounded-full" },
  case_management_coordinator: { label: "Case Coordinator", className: "bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full" },
  deo: { label: "Data Entry Operator", className: "bg-slate-100 text-slate-700 border-slate-200 rounded-full" }
};

export const ROLE_NUMERIC_MAP = {
  admin: 1,
  field_supervisor: 2,
  staff_nurse: 3,
  doctor: 4,
  counselor: 5,
  case_management_coordinator: 6,
  deo: 7
};

export const ROLE_KEY_MAP = {
  1: "admin",
  2: "field_supervisor",
  3: "staff_nurse",
  4: "doctor",
  5: "counselor",
  6: "case_management_coordinator",
  7: "deo"
};

export const TENANTS_LIST = ["Dharavi", "Malvani", "Vashi", "Kurla", "Ghatkopar"];

export function UserManagement({ notify, onOpenMobileMenu }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [selectedTenant, setSelectedTenant] = useState("All");
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedUserPrivileges, setExpandedUserPrivileges] = useState({});
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "staff_nurse",
    location: "Dharavi",
    email: "",
    mobile: "",
    status: "1",
    privileges: []
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [tenantsList, setTenantsList] = useState([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");

  useEffect(() => {
    fetchUsers();
    fetchTenantLocations();
  }, []);

  const fetchTenantLocations = async () => {
    try {
      const res = await api.get("/api/v1/location/index");
      if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        const dynamicLocs = res.data.map(l => l.loc_name || l.loc_city).filter(Boolean);
        const uniqueLocs = Array.from(new Set(dynamicLocs));
        setTenantsList(uniqueLocs);
        localStorage.setItem('ncd_locations_master', JSON.stringify(uniqueLocs));
      }
    } catch (e) {
      try {
        const stored = localStorage.getItem('ncd_locations_master');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) setTenantsList(parsed);
        }
      } catch (err) {}
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/users/index");
      if (res.status === 'success') {
        const rawUsers = res.data || [];
        const processed = rawUsers.map(u => {
          const uRoleId = parseInt(u.user_role) || 2;
          const roleKey = u.role || u.state_code || ROLE_KEY_MAP[uRoleId] || 'field_supervisor';
          let privileges = u.privileges || u.signedin_loc;
          if (typeof privileges === 'string') {
            try { privileges = JSON.parse(privileges); } catch (e) { privileges = null; }
          }
          if (!Array.isArray(privileges)) {
            privileges = getDefaultModulesForRole(roleKey);
          }
          return {
            ...u,
            username: u.username || u.users_name || "",
            role: roleKey,
            location: u.location || u.loc_code || "Dharavi",
            privileges
          };
        });
        setUsers(processed);
      }
    } catch (e) {
      console.error(e);
      notify("error", "Error", "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setFormData({
      ...formData,
      role: newRole,
      privileges: getDefaultModulesForRole(newRole)
    });
  };

  const togglePrivilege = (modId) => {
    const current = formData.privileges || [];
    if (current.includes(modId)) {
      setFormData({
        ...formData,
        privileges: current.filter(id => id !== modId)
      });
    } else {
      setFormData({
        ...formData,
        privileges: [...current, modId].sort((a, b) => a - b)
      });
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.usr_id);
    setFormData({
      username: u.username || "",
      password: "",
      role: u.role || "staff_nurse",
      location: u.location || u.loc_code || "Dharavi",
      email: u.email || "",
      mobile: u.mobile || "",
      status: u.status || "1",
      privileges: Array.isArray(u.privileges) ? u.privileges : getDefaultModulesForRole(u.role || "staff_nurse")
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user account?")) {
      try {
        const res = await api.delete(`/api/v1/users/delete?id=${id}`);
        if (res.status === 'success') {
          notify("success", "Deleted", "User account removed.");
          fetchUsers();
        }
      } catch (e) {
        notify("error", "Error", "Failed to delete user.");
      }
    }
  };

  const handleSave = async () => {
    const cleanUsername = (formData.username || "").trim();
    const cleanPassword = (formData.password || "").trim();

    if (!cleanUsername) {
      notify("error", "Validation Error", "Username is required.");
      return;
    }

    if (!editingId && !cleanPassword) {
      notify("error", "Validation Error", "Password is required for new user accounts.");
      return;
    }

    try {
      const numericRole = ROLE_NUMERIC_MAP[formData.role] || 7;
      const payload = {
        username: cleanUsername,
        users_name: cleanUsername,
        full_name: cleanUsername,
        loc_code: formData.location || 'Dharavi',
        location: formData.location || 'Dharavi',
        password: cleanPassword,
        role: formData.role,
        user_role: numericRole,
        email: (formData.email || "").trim(),
        mobile: (formData.mobile || "").trim(),
        status: formData.status || "1",
        privileges: formData.privileges || []
      };

      if (editingId) {
        const res = await api.put(`/api/v1/users/update?id=${editingId}`, payload);
        if (res.status === 'success') {
          notify("success", "User Updated", `Account '${cleanUsername}' updated successfully.`);
          setShowForm(false);
          setEditingId(null);
          setFormData({ username: "", password: "", role: "staff_nurse", location: "Dharavi", email: "", mobile: "", status: "1", privileges: getDefaultModulesForRole("staff_nurse") });
          fetchUsers();
        } else {
          const errMsg = res.message || (res.errors ? Object.values(res.errors).flat().join(", ") : "Failed to update user.");
          notify("error", "Update Failed", errMsg);
        }
      } else {
        const res = await api.post("/api/v1/users/create", payload);
        if (res.status === 'success') {
          notify("success", "User Provisioned", `User '${cleanUsername}' created successfully. You can now log in with username '${cleanUsername}' and password '${cleanPassword}'.`);
          setShowForm(false);
          setEditingId(null);
          setFormData({ username: "", password: "", role: "staff_nurse", location: "Dharavi", email: "", mobile: "", status: "1", privileges: [] });
          fetchUsers();
        } else {
          const errMsg = res.message || (res.errors ? Object.values(res.errors).flat().join(", ") : "Failed to create user.");
          notify("error", "Creation Failed", errMsg);
        }
      }
    } catch (e) {
      console.error(e);
      notify("error", "Error", e.message || "Failed to save user account.");
    }
  };

  const toggleUserPrivilegeExpand = (userId) => {
    setExpandedUserPrivileges(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const filteredUsers = users.filter(u => {
    const matchesTenant = selectedTenant === "All" || (u.location || u.loc_code || "").toLowerCase() === selectedTenant.toLowerCase();
    const matchesRole = selectedRoleFilter === "All" || (u.role || "").toLowerCase() === selectedRoleFilter.toLowerCase();
    const matchesSearch = 
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.location && u.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTenant && matchesRole && matchesSearch;
  });

  const getPrivilegeSummaryText = (privs) => {
    const list = Array.isArray(privs) ? privs : [];
    if (list.length === 16) return "Full Access (16/16 Modules)";
    if (list.length === 0) return "No Access (0 Modules)";
    const names = SCREENING_MODULES.filter(m => list.includes(m.id)).map(m => m.title);
    if (names.length <= 3) return `${names.length} Modules (${names.join(", ")})`;
    return `${names.length} Modules (${names.slice(0, 2).join(", ")} +${names.length - 2} more)`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/60">
      
      {/* Clean Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onOpenMobileMenu && onOpenMobileMenu()}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer shrink-0"
              title="Open Navigation"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                Tenant (Location) & User Access Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">
                Map location tenants and provision dedicated staff role user accounts.
              </p>
            </div>
          </div>

          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ username: "", password: "", role: "staff_nurse", location: selectedTenant !== "All" ? selectedTenant : (tenantsList[0] || ""), email: "", mobile: "", status: "1", privileges: [] });
              setShowForm(true);
            }}
            className="sm:hidden px-3.5 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus size={15} />
            Provision
          </button>
        </div>

        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ username: "", password: "", role: "staff_nurse", location: selectedTenant !== "All" ? selectedTenant : (tenantsList[0] || ""), email: "", mobile: "", status: "1", privileges: [] });
            setShowForm(true);
          }}
          className="hidden sm:flex px-4 py-2.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-colors items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          Create User
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4">
        
        {/* Tenant Location Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono">
          <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1 mr-1 shrink-0">
            <Building2 size={15} className="text-amber-600" /> Tenant:
          </span>
          {["All", ...tenantsList].map(t => {
            const isSel = selectedTenant === t;
            const count = t === "All" ? users.length : users.filter(u => (u.location || u.loc_code || "").toLowerCase() === t.toLowerCase()).length;
            return (
              <button
                key={t}
                onClick={() => setSelectedTenant(t)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 border ${isSel ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-2xs font-extrabold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                {t === "All" ? "All Tenants" : t} ({count})
              </button>
            );
          })}
        </div>

        {/* Assigned Role Filter Pills (Including Admin) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono">
          <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1 mr-1 shrink-0">
            <ShieldCheck size={15} className="text-slate-600" /> Role:
          </span>
          {["All", "admin", "field_supervisor", "staff_nurse", "counselor", "doctor", "case_management_coordinator", "deo"].map(rk => {
            const isSel = selectedRoleFilter === rk;
            const label = rk === "All" ? "All Roles" : ROLE_CONFIGS[rk]?.label || rk;
            const count = rk === "All" ? users.length : users.filter(u => (u.role || "").toLowerCase() === rk.toLowerCase()).length;
            return (
              <button
                key={rk}
                onClick={() => setSelectedRoleFilter(rk)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 border ${isSel ? 'bg-slate-900 text-white border-slate-950 shadow-2xs font-extrabold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Selected Tenant Summary Banner */}
        {selectedTenant !== "All" && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Building2 size={20} className="text-amber-700 shrink-0" />
              <div>
                <span className="font-extrabold uppercase text-amber-950 text-xs font-mono block">Tenant Location: {selectedTenant}</span>
                <span className="text-[11px] text-amber-800 font-medium font-mono">
                  {filteredUsers.length} Dedicated Staff User(s) Assigned to {selectedTenant}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.keys(ROLE_CONFIGS).map(rk => {
                const count = filteredUsers.filter(u => u.role === rk).length;
                if (count === 0) return null;
                return (
                  <span key={rk} className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] font-bold border border-amber-200 shadow-2xs font-mono">
                    {ROLE_CONFIGS[rk].label}: {count}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
            No user accounts found matching search query.
          </div>
        ) : (
          /* Clean Professional Table Layout Matching Design System */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono">
                SYSTEM ACCOUNTS ({filteredUsers.length})
              </span>
              <span className="text-xs text-slate-400 font-medium font-sans">
                Click any user row to view or modify privileges
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-4 px-6">USER ACCOUNT</th>
                  <th className="py-4 px-4">ASSIGNED ROLE</th>
                  <th className="py-4 px-4">ASSIGNED LOCATION</th>
                  <th className="py-4 px-4">CONTACT INFO</th>
                  <th className="py-4 px-4">MODULE PRIVILEGES ACCESS</th>
                  <th className="py-4 px-4">STATUS</th>
                  <th className="py-4 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => {
                  const roleCfg = ROLE_CONFIGS[u.role] || ROLE_CONFIGS.deo;
                  const privs = Array.isArray(u.privileges) ? u.privileges : [];
                  const isExpanded = expandedUserPrivileges[u.usr_id];

                  return (
                    <React.Fragment key={u.usr_id}>
                      <tr className="hover:bg-slate-50/70 transition-colors border-b border-slate-100">
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 shrink-0 font-mono shadow-2xs">
                              {String(u.username || "US").substring(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[140px] font-extrabold text-slate-900 text-sm font-sans">{u.username}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span 
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold border shadow-2xs whitespace-nowrap ${roleCfg.className}`}
                          >
                            <ShieldCheck size={13} className="shrink-0" />
                            <span>{roleCfg.label}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100/90 text-amber-950 border border-amber-300 font-mono shadow-2xs">
                            <MapPin size={12} className="text-amber-700 shrink-0" />
                            <span>
                              {(() => {
                                const l = String(u.location || 'Dharavi').trim().toLowerCase();
                                if (l.includes("dharavi")) return "DH";
                                if (l.includes("malvani")) return "ML";
                                if (l.includes("vashi")) return "VA";
                                if (l.includes("kurla")) return "KR";
                                if (l.includes("ghatkopar")) return "GK";
                                return String(u.location || 'DH').substring(0, 2).toUpperCase();
                              })()}
                            </span>
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-600 font-medium">
                          <div>{u.email || <span className="text-slate-400 italic">No email</span>}</div>
                          {u.mobile && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{u.mobile}</div>}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-xs">
                              {getPrivilegeSummaryText(privs)}
                            </span>
                            {privs.length > 0 && privs.length < 16 && (
                              <button 
                                onClick={() => toggleUserPrivilegeExpand(u.usr_id)}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-bold shrink-0 ml-1 cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                {isExpanded ? "Hide" : "Details"}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {u.status == "1" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <span className="w-2 h-2 rounded-full bg-slate-300"></span> Disabled
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(u)}
                              className="px-3 py-1 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1 text-xs font-bold shadow-2xs cursor-pointer"
                              title="Edit User & Privileges"
                            >
                              <Edit2 size={13} className="text-slate-500" /> Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(u.usr_id)}
                              className="p-1.5 rounded-xl border border-red-200/80 bg-white text-red-500 hover:bg-red-50 transition-colors inline-flex items-center justify-center shadow-2xs cursor-pointer"
                              title="Delete User Account"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Module Breakdown */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-100">
                          <td colSpan={7} className="py-3.5 px-6">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                              Active Granted Screening Modules ({privs.length}):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {SCREENING_MODULES.filter(m => privs.includes(m.id)).map(m => (
                                <span key={m.id} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold shadow-2xs font-mono">
                                  #{m.id} {m.title}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Clean Professional User Provisioning Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div 
            className="w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-200 flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingId ? "Edit User Provisioning & Privileges" : "Provision New Staff User"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set user account credentials and configure 16 screening section access privileges.
                </p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Username *
                  </label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="e.g. nurse_staff_01"
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {editingId ? "Reset Password (Optional)" : "Password *"}
                  </label>
                  <input 
                    type="password" 
                    placeholder={editingId ? "Leave blank to keep unchanged" : "••••••••"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Operational Role *
                  </label>
                  <select 
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 font-medium outline-none bg-white"
                  >
                    <option value="field_supervisor">Field Supervisor</option>
                    <option value="staff_nurse">Staff Nurse</option>
                    <option value="counselor">Counselor</option>
                    <option value="doctor">Doctor</option>
                    <option value="case_management_coordinator">Case Coordinator</option>
                    <option value="deo">Data Entry Operator (DEO)</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Assigned Location *
                  </label>
                  <select 
                    value={formData.location || "All"}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 font-bold outline-none bg-white text-gray-900"
                  >
                    <option value="All">All Locations (Universal Access)</option>
                    {tenantsList.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="staff@ncd.org"
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Account Status
                  </label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 outline-none bg-white"
                  >
                    <option value="1">Active Account</option>
                    <option value="0">Disabled Account</option>
                  </select>
                </div>
              </div>

              {/* 16 Screening Modules Clean Checkbox Panel */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                    Module Access Privileges ({formData.privileges.length} / 16)
                  </span>

                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, privileges: SCREENING_MODULES.map(m => m.id) })}
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, privileges: [] })}
                      className="text-[11px] text-gray-500 hover:underline font-medium"
                    >
                      Clear All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, privileges: getDefaultModulesForRole(formData.role) })}
                      className="text-[11px] text-emerald-600 hover:underline font-medium flex items-center gap-0.5"
                    >
                      <RefreshCw size={10} /> Reset Role Defaults
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {SCREENING_MODULES.map((mod) => {
                    const isChecked = (formData.privileges || []).includes(mod.id);
                    return (
                      <label 
                        key={mod.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-colors ${
                          isChecked ? "bg-white border-gray-400 shadow-2xs" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white"
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePrivilege(mod.id)}
                          className="rounded text-gray-900 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-gray-800 font-medium truncate">
                          {mod.id}. {mod.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50/50">
              <button 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-colors"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
