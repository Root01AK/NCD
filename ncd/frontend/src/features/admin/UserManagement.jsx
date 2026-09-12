import React, { useState, useEffect } from "react";
import { Plus, Search, UserCircle2, Edit2, Trash2, ShieldCheck, Mail, ShieldAlert, X, Loader2, RefreshCw, Lock, Menu, Building2, MapPin, Shield, Check, Filter, UserPlus, Users, CheckCircle2, ChevronRight, Eye } from "lucide-react";
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
  admin: { label: "Administrator", className: "bg-amber-50/80 text-amber-800 border-amber-200/80" },
  field_supervisor: { label: "Field Supervisor", className: "bg-blue-50/80 text-blue-700 border-blue-200/80" },
  staff_nurse: { label: "Staff Nurse", className: "bg-emerald-50/80 text-emerald-700 border-emerald-200/80" },
  counselor: { label: "Counselor", className: "bg-pink-50/80 text-pink-700 border-pink-200/80" },
  doctor: { label: "Doctor", className: "bg-purple-50/80 text-purple-700 border-purple-200/80" },
  case_management_coordinator: { label: "Case Coordinator", className: "bg-indigo-50/80 text-indigo-700 border-indigo-200/80" },
  deo: { label: "Data Entry Operator", className: "bg-slate-100 text-slate-700 border-slate-200" }
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

export const DEFAULT_MASTER_USERS = [
  { usr_id: 1, username: "admin_user", users_name: "admin_user", full_name: "System Administrator", email: "admin@ncd.yrgcare.org", role: "admin", location: "All", privileges: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], status: "1" },
  { usr_id: 2, username: "react_admin", users_name: "react_admin", full_name: "React System Admin", email: "react_admin@ncd.yrgcare.org", role: "admin", location: "All", privileges: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], status: "1" },
  { usr_id: 3, username: "FS001", users_name: "FS001", full_name: "Field Supervisor (Dharavi)", email: "fs001@ncd.yrgcare.org", role: "field_supervisor", location: "Dharavi", privileges: [1, 16], status: "1" },
  { usr_id: 4, username: "SN001", users_name: "SN001", full_name: "Staff Nurse (Dharavi)", email: "sn001@ncd.yrgcare.org", role: "staff_nurse", location: "Dharavi", privileges: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11], status: "1" },
  { usr_id: 5, username: "C001", users_name: "C001", full_name: "Counselor (Dharavi)", email: "c001@ncd.yrgcare.org", role: "counselor", location: "Dharavi", privileges: [8, 15], status: "1" },
  { usr_id: 6, username: "D001", users_name: "D001", full_name: "Doctor (Dharavi)", email: "d001@ncd.yrgcare.org", role: "doctor", location: "Dharavi", privileges: [12, 13], status: "1" },
  { usr_id: 7, username: "CMC001", users_name: "CMC001", full_name: "Case Coordinator (Dharavi)", email: "cmc001@ncd.yrgcare.org", role: "case_management_coordinator", location: "Dharavi", privileges: [14], status: "1" },
  { usr_id: 8, username: "DEO", users_name: "DEO", full_name: "Data Entry Operator (Dharavi)", email: "deo@ncd.yrgcare.org", role: "deo", location: "Dharavi", privileges: [1, 16], status: "1" },
];

export function UserManagement({ notify, onOpenMobileMenu }) {
  const [users, setUsers] = useState(DEFAULT_MASTER_USERS);
  const [loading, setLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState("All");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [tenantsList, setTenantsList] = useState(TENANTS_LIST);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingModulesUser, setViewingModulesUser] = useState(null);

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

  useEffect(() => {
    fetchUsers();
    fetchTenantLocations();
  }, []);

  const fetchTenantLocations = async () => {
    try {
      const res = await api.get("/api/v1/location/index");
      if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        const dynamicLocs = res.data.map(l => l.loc_name || l.loc_city).filter(Boolean);
        const uniqueLocs = Array.from(new Set([...TENANTS_LIST, ...dynamicLocs]));
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
      if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        const rawUsers = res.data;
        const processed = rawUsers.map(u => {
          const uRoleId = parseInt(u.user_role) || 2;
          const roleKey = u.role || u.state_code || ROLE_KEY_MAP[uRoleId] || 'field_supervisor';
          let privileges = u.privileges;
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
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateAdmin = () => {
    setEditingId(null);
    setFormData({
      username: "react_admin",
      password: "admin123",
      role: "admin",
      location: "All",
      email: "react_admin@ncd.yrgcare.org",
      mobile: "",
      status: "1",
      privileges: SCREENING_MODULES.map(m => m.id)
    });
    setShowForm(true);
  };

  const handleOpenCreateStaff = () => {
    setEditingId(null);
    setFormData({
      username: "",
      password: "staff123",
      role: "staff_nurse",
      location: selectedTenant !== "All" ? selectedTenant : (tenantsList[0] || "Dharavi"),
      email: "",
      mobile: "",
      status: "1",
      privileges: getDefaultModulesForRole("staff_nurse")
    });
    setShowForm(true);
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
          if (notify) notify("success", "Deleted", "User account removed.");
          fetchUsers();
        }
      } catch (e) {
        if (notify) notify("error", "Error", "Failed to delete user.");
      }
    }
  };

  const handleSave = async () => {
    const cleanUsername = (formData.username || "").trim();
    const cleanPassword = (formData.password || "").trim();

    if (!cleanUsername) {
      if (notify) notify("error", "Validation Error", "Username is required.");
      return;
    }

    if (!editingId && !cleanPassword) {
      if (notify) notify("error", "Validation Error", "Password is required for new user accounts.");
      return;
    }

    try {
      const numericRole = ROLE_NUMERIC_MAP[formData.role] || 7;
      const payload = {
        username: cleanUsername,
        users_name: cleanUsername,
        full_name: cleanUsername === "react_admin" ? "React System Admin" : cleanUsername,
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
          if (notify) notify("success", "User Updated", `Account '${cleanUsername}' updated successfully.`);
          setShowForm(false);
          setEditingId(null);
          fetchUsers();
        } else {
          const errMsg = res.message || "Failed to update user.";
          if (notify) notify("error", "Update Failed", errMsg);
        }
      } else {
        const res = await api.post("/api/v1/users/create", payload);
        if (res.status === 'success') {
          if (notify) notify("success", "User Provisioned", `User '${cleanUsername}' created successfully.`);
          setShowForm(false);
          setEditingId(null);
          fetchUsers();
        } else {
          const errMsg = res.message || "Failed to create user.";
          if (notify) notify("error", "Creation Failed", errMsg);
        }
      }
    } catch (e) {
      console.error(e);
      if (notify) notify("error", "Error", e.message || "Failed to save user account.");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesTenant = selectedTenant === "All" || (u.location || u.loc_code || "").toLowerCase() === selectedTenant.toLowerCase();
    const matchesRole = selectedRoleFilter === "All" || (u.role || "").toLowerCase() === selectedRoleFilter.toLowerCase();
    const matchesStatus = selectedStatusFilter === "All" || String(u.status) === selectedStatusFilter;
    const matchesSearch = 
      !searchTerm ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.location && u.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTenant && matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      
      {/* Sleek Enterprise Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onOpenMobileMenu && onOpenMobileMenu()}
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
            title="Open Navigation"
          >
            <Menu size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
                User & Access Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                {users.length} Total Users
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage clinical team members, facility assignments, and screening section permissions.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={handleOpenCreateAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100/80 transition-colors cursor-pointer shadow-2xs"
            title="Provision React Super Admin"
          >
            <Shield size={14} className="text-amber-700" />
            <span>+ Quick React Admin</span>
          </button>

          <button 
            onClick={handleOpenCreateStaff}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-black text-white transition-colors cursor-pointer shadow-2xs"
            title="Add New Clinical Staff User"
          >
            <UserPlus size={14} className="text-amber-400" />
            <span>+ Add User</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
        
        {/* Sleek Filter Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Field */}
          <div className="relative flex-1 min-w-[260px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, role, email, center..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Clean Dropdown Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            
            {/* Role Filter */}
            <select 
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="All">All Roles ({users.length})</option>
              <option value="admin">Administrator ({users.filter(u => u.role === "admin").length})</option>
              <option value="field_supervisor">Field Supervisor ({users.filter(u => u.role === "field_supervisor").length})</option>
              <option value="staff_nurse">Staff Nurse ({users.filter(u => u.role === "staff_nurse").length})</option>
              <option value="doctor">Doctor ({users.filter(u => u.role === "doctor").length})</option>
              <option value="counselor">Counselor ({users.filter(u => u.role === "counselor").length})</option>
              <option value="case_management_coordinator">Case Coordinator ({users.filter(u => u.role === "case_management_coordinator").length})</option>
              <option value="deo">Data Entry Operator ({users.filter(u => u.role === "deo").length})</option>
            </select>

            {/* Location Filter */}
            <select 
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="All">All Centers</option>
              {["All", ...tenantsList].filter(t => t !== "All").map(loc => (
                <option key={loc} value={loc}>{loc} Center</option>
              ))}
            </select>

            {/* Status Filter */}
            <select 
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="All">All Status</option>
              <option value="1">Active</option>
              <option value="0">Disabled</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchUsers}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shrink-0"
              title="Refresh User Directory"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-slate-900" : ""} />
            </button>
          </div>

        </div>

        {/* Directory Table Card */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-slate-200/80">
            <Loader2 className="animate-spin text-slate-600 mb-2" size={24} />
            <span className="text-xs text-slate-500 font-medium">Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-slate-200/80 text-slate-500 text-xs space-y-2">
            <Users size={28} className="mx-auto text-slate-300 mb-1" />
            <div className="font-semibold text-slate-800 text-sm">No accounts found</div>
            <div>Try adjusting your search criteria or filters.</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">User Account</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Center</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Module Permissions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.map((u) => {
                    const roleCfg = ROLE_CONFIGS[u.role] || ROLE_CONFIGS.deo;
                    const privs = Array.isArray(u.privileges) ? u.privileges : [];

                    return (
                      <tr key={u.usr_id} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* User Account */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200/80 shrink-0">
                              {String(u.username || "U").substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 leading-tight">
                                {u.username}
                              </div>
                              {u.full_name && u.full_name !== u.username && (
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {u.full_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md border ${roleCfg.className}`}>
                            <ShieldCheck size={12} className="shrink-0" />
                            <span>{roleCfg.label}</span>
                          </span>
                        </td>

                        {/* Center Location */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <MapPin size={11} className="text-slate-500 shrink-0" />
                            <span>{u.location || "All Centers"}</span>
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{u.email || <span className="text-slate-400 italic text-[11px]">No email</span>}</div>
                          {u.mobile && <div className="text-[11px] text-slate-400 mt-0.5">{u.mobile}</div>}
                        </td>

                        {/* Module Permissions */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button 
                            onClick={() => setViewingModulesUser(u)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 transition-colors border border-blue-200/60 cursor-pointer"
                            title="Click to view full permission matrix"
                          >
                            <span>{privs.length === 16 ? "Full Access (16/16)" : `${privs.length} Modules`}</span>
                            <ChevronRight size={12} className="opacity-60" />
                          </button>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.status == "1" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Disabled
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleEdit(u)}
                              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
                              title="Edit User"
                            >
                              <Edit2 size={12} className="text-slate-400" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(u.usr_id)}
                              className="p-1.5 rounded-md border border-red-200/70 bg-white text-red-500 hover:bg-red-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Stats */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> total accounts</span>
              <span className="text-[11px] text-slate-400">YRG CARE Swasth Abhiyan Portal</span>
            </div>

          </div>
        )}

      </div>

      {/* Module Breakdown Modal */}
      {viewingModulesUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="w-full max-w-lg rounded-2xl shadow-xl overflow-hidden bg-white border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-amber-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Clinical Screening Permissions
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Granted {Array.isArray(viewingModulesUser.privileges) ? viewingModulesUser.privileges.length : 0} of 16 modules for <strong className="text-slate-800">{viewingModulesUser.username}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingModulesUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SCREENING_MODULES.map(m => {
                  const hasAccess = Array.isArray(viewingModulesUser.privileges) && viewingModulesUser.privileges.includes(m.id);
                  return (
                    <div 
                      key={m.id}
                      className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                        hasAccess ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 font-medium' : 'bg-slate-50 border-slate-200/80 text-slate-400 opacity-60'
                      }`}
                    >
                      <span>#{m.id} {m.title}</span>
                      {hasAccess ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Off</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 flex justify-between items-center bg-slate-50/80">
              <button 
                onClick={() => {
                  const targetUser = viewingModulesUser;
                  setViewingModulesUser(null);
                  handleEdit(targetUser);
                }}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Edit Permissions
              </button>
              <button 
                onClick={() => setViewingModulesUser(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Provisioning & Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden bg-white border border-slate-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs">
                  {formData.role === "admin" ? <Shield size={16} /> : <UserCircle2 size={16} />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingId ? "Edit User Account & Privileges" : formData.role === "admin" ? "Provision React Super Administrator" : "Provision New User Account"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Set login credentials and granted screening section access.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Quick Template Presets */}
              {!editingId && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs overflow-x-auto">
                  <span className="font-semibold text-slate-700 shrink-0">Role Templates:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        username: "react_admin",
                        password: "admin123",
                        role: "admin",
                        location: "All",
                        email: "react_admin@ncd.yrgcare.org",
                        mobile: "",
                        status: "1",
                        privileges: SCREENING_MODULES.map(m => m.id)
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-amber-100 text-amber-950 font-medium hover:bg-amber-200 cursor-pointer shrink-0"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        username: `SN_${Math.floor(100 + Math.random() * 900)}`,
                        password: "nurse123",
                        role: "staff_nurse",
                        location: "Dharavi",
                        email: "",
                        mobile: "",
                        status: "1",
                        privileges: getDefaultModulesForRole("staff_nurse")
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 cursor-pointer shrink-0"
                  >
                    Staff Nurse
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        username: `DOC_${Math.floor(100 + Math.random() * 900)}`,
                        password: "doctor123",
                        role: "doctor",
                        location: "Dharavi",
                        email: "",
                        mobile: "",
                        status: "1",
                        privileges: getDefaultModulesForRole("doctor")
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 cursor-pointer shrink-0"
                  >
                    Doctor
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Username *
                  </label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="e.g. SN001 or react_admin"
                    className="w-full px-3 py-2 rounded-lg text-xs border border-slate-300 focus:outline-none focus:border-slate-800 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {editingId ? "Reset Password (Optional)" : "Password *"}
                  </label>
                  <input 
                    type="text" 
                    placeholder={editingId ? "Leave blank to keep unchanged" : "e.g. admin123"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-slate-300 focus:outline-none focus:border-slate-800 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operational Role *
                  </label>
                  <select 
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-slate-300 font-medium outline-none bg-white text-slate-900"
                  >
                    <option value="admin">Administrator</option>
                    <option value="field_supervisor">Field Supervisor</option>
                    <option value="staff_nurse">Staff Nurse</option>
                    <option value="counselor">Counselor</option>
                    <option value="doctor">Doctor</option>
                    <option value="case_management_coordinator">Case Coordinator</option>
                    <option value="deo">Data Entry Operator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Center Facility *
                  </label>
                  <select 
                    value={formData.location || "All"}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-slate-300 font-medium outline-none bg-white text-slate-900"
                  >
                    <option value="All">All Centers</option>
                    {tenantsList.map(loc => (
                      <option key={loc} value={loc}>{loc} Center</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="user@ncd.yrgcare.org"
                    className="w-full px-3 py-2 rounded-lg text-xs border border-slate-300 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-slate-300 outline-none bg-white font-medium"
                  >
                    <option value="1">Active</option>
                    <option value="0">Disabled</option>
                  </select>
                </div>
              </div>

              {/* 16 Screening Modules Privileges Grid */}
              <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-800 text-xs">
                    Granted Module Permissions ({formData.privileges.length} / 16)
                  </span>

                  <div className="flex items-center gap-2 text-xs">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, privileges: SCREENING_MODULES.map(m => m.id) })}
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, privileges: [] })}
                      className="text-slate-500 hover:underline font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                    <span className="text-slate-300">|</span>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, privileges: getDefaultModulesForRole(formData.role) })}
                      className="text-emerald-600 hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
                    >
                      Reset Role Defaults
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {SCREENING_MODULES.map((mod) => {
                    const isChecked = (formData.privileges || []).includes(mod.id);
                    return (
                      <label 
                        key={mod.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                          isChecked ? "bg-white border-emerald-300 text-slate-900 font-medium shadow-2xs" : "bg-slate-100/60 border-slate-200 text-slate-500 hover:bg-white"
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePrivilege(mod.id)}
                          className="rounded text-slate-900 focus:ring-0 cursor-pointer w-4 h-4 accent-emerald-600"
                        />
                        <span className="text-xs truncate">
                          #{mod.id} {mod.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 flex justify-end gap-2.5 bg-slate-50/80">
              <button 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-black text-white transition-colors cursor-pointer"
              >
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
