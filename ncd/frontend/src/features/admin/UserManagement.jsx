import React, { useState, useEffect } from "react";
import { Plus, Search, UserCircle2, Edit2, Trash2, ShieldCheck, Mail, ShieldAlert, X, Loader2, Layers, CheckCircle2, Check, RefreshCw, ChevronDown, ChevronUp, Lock } from "lucide-react";
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
  admin: { label: "System Administrator", badgeBg: "#f4f4f5", badgeColor: "#18181b" },
  field_supervisor: { label: "Field Supervisor", badgeBg: "#eff6ff", badgeColor: "#1d4ed8" },
  staff_nurse: { label: "Staff Nurse", badgeBg: "#ecfdf5", badgeColor: "#047857" },
  counselor: { label: "Counselor", badgeBg: "#fdf2f8", badgeColor: "#be185d" },
  doctor: { label: "Doctor", badgeBg: "#faf5ff", badgeColor: "#6b21a8" },
  case_management_coordinator: { label: "Case Coordinator", badgeBg: "#eef2ff", badgeColor: "#3730a3" },
  deo: { label: "Data Entry Operator", badgeBg: "#f1f5f9", badgeColor: "#334155" }
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

export function UserManagement({ notify }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedUserPrivileges, setExpandedUserPrivileges] = useState({});
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "staff_nurse",
    email: "",
    mobile: "",
    status: "1",
    privileges: getDefaultModulesForRole("staff_nurse")
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

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
        loc_code: 'DH',
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
          setFormData({ username: "", password: "", role: "staff_nurse", email: "", mobile: "", status: "1", privileges: getDefaultModulesForRole("staff_nurse") });
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
          setFormData({ username: "", password: "", role: "staff_nurse", email: "", mobile: "", status: "1", privileges: getDefaultModulesForRole("staff_nurse") });
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

  const filteredUsers = users.filter(u => 
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            User Management & Access Control
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Provision staff user accounts and configure 16 screening section access privileges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm">
            <Search size={15} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search user or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-xs w-48 text-gray-800"
            />
          </div>
          
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ username: "", password: "", role: "staff_nurse", email: "", mobile: "", status: "1", privileges: getDefaultModulesForRole("staff_nurse") });
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={15} />
            Provision User
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        
        {loading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
            No user accounts found matching search query.
          </div>
        ) : (
          /* Clean Professional Table Layout */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                System Accounts ({filteredUsers.length})
              </span>
              <span className="text-xs text-gray-400">
                Click any user row to view or modify privileges
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-6">User Account</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Module Privileges Access</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredUsers.map((u) => {
                  const roleCfg = ROLE_CONFIGS[u.role] || ROLE_CONFIGS.deo;
                  const privs = Array.isArray(u.privileges) ? u.privileges : [];
                  const isExpanded = expandedUserPrivileges[u.usr_id];

                  return (
                    <React.Fragment key={u.usr_id}>
                      <tr className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs border border-gray-200 shrink-0">
                              {u.username.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[140px]">{u.username}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                            style={{ background: roleCfg.badgeBg, color: roleCfg.badgeColor, borderColor: "rgba(0,0,0,0.06)" }}
                          >
                            {roleCfg.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-600">
                          <div>{u.email || <span className="text-gray-400 italic">No email</span>}</div>
                          {u.mobile && <div className="text-[10px] text-gray-400">{u.mobile}</div>}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                              {getPrivilegeSummaryText(privs)}
                            </span>
                            {privs.length > 0 && privs.length < 16 && (
                              <button 
                                onClick={() => toggleUserPrivilegeExpand(u.usr_id)}
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-medium ml-1"
                              >
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                {isExpanded ? "Hide" : "Details"}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {u.status == "1" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> Disabled
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-6 text-right space-x-2">
                          <button 
                            onClick={() => handleEdit(u)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                            title="Edit Privileges"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(u.usr_id)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Module Breakdown */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-gray-200">
                          <td colSpan={6} className="py-3 px-6">
                            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Active Granted Screening Modules ({privs.length}):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {SCREENING_MODULES.filter(m => privs.includes(m.id)).map(m => (
                                <span key={m.id} className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 text-[11px] font-medium">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
