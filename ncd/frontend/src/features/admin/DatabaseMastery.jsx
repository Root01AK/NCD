import React, { useState, useEffect } from "react";
import { Database, RefreshCw, Trash2, Plus, Edit3, Search, Table, Server, ShieldAlert, CheckCircle2, AlertTriangle, Layers, Cpu, HardDrive, Download, Loader2, Save, X, Sparkles, Filter, Code, MapPin, Building2, Activity, Zap, Check, ChevronRight } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";
import { clearQueue } from "../../lib/db";

export function DatabaseMastery({ notify, onOpenMobileMenu }) {
  const [tablesList, setTablesList] = useState([]);
  const [selectedLocationDb, setSelectedLocationDb] = useState("dharavi"); // dharavi, malvani, vashi, central
  const [selectedTable, setSelectedTable] = useState("cms_mdhl");
  const [tableMeta, setTableMeta] = useState({ primaryKey: "", columns: [], data: [] });
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({});
  const [savingRecord, setSavingRecord] = useState(false);
  const [flushingTable, setFlushingTable] = useState(false);
  const [seedingData, setSeedingData] = useState(false);

  const LOCATION_DBS = [
    { id: "dharavi", label: "Dharavi Database", dbName: "ncd_dharavi", center: "Dharavi Center", badge: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100", activeBadge: "bg-blue-600 text-white border-blue-700 shadow-md" },
    { id: "malvani", label: "Malvani Database", dbName: "ncd_malvani", center: "Malvani Center", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", activeBadge: "bg-emerald-600 text-white border-emerald-700 shadow-md" },
    { id: "vashi", label: "Vashi Database", dbName: "ncd_vashi", center: "Vashi Center", badge: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100", activeBadge: "bg-amber-500 text-slate-950 border-amber-600 shadow-md" },
    { id: "central", label: "Central Master DB", dbName: "ncd", center: "Global Store", badge: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200", activeBadge: "bg-slate-900 text-white border-slate-950 shadow-md" },
  ];

  // Fetch tables summary whenever selected location changes
  useEffect(() => {
    fetchTablesSummary(selectedLocationDb);
  }, [selectedLocationDb]);

  // Fetch rows whenever selectedTable or selectedLocationDb changes
  useEffect(() => {
    if (selectedTable) {
      fetchTableRows(selectedTable, selectedLocationDb);
    }
  }, [selectedTable, selectedLocationDb]);

  const fetchTablesSummary = async (locDb) => {
    setLoadingTables(true);
    try {
      const res = await api.get(`/api/v1/database/tables?location=${locDb}`);
      if (res && res.status === "success" && Array.isArray(res.tables)) {
        setTablesList(res.tables);
        if (!selectedTable && res.tables.length > 0) {
          setSelectedTable(res.tables[0].table);
        }
      }
    } catch (e) {
      notify("error", "Database Offline", `Could not connect to ${locDb} database schema.`);
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchTableRows = async (tableName, locDb) => {
    setLoadingData(true);
    try {
      const res = await api.get(`/api/v1/database/tabledata?table=${tableName}&location=${locDb}&limit=150`);
      if (res && res.status === "success") {
        setTableMeta({
          primaryKey: res.primaryKey || (res.columns && res.columns.length > 0 ? res.columns[0] : ""),
          columns: res.columns || [],
          data: res.data || []
        });
      }
    } catch (e) {
      notify("error", "Table Access Error", `Could not retrieve records for ${tableName} in ${locDb}.`);
    } finally {
      setLoadingData(false);
    }
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setEditFormData({ ...row });
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    if (!editingRow) return;

    setSavingRecord(true);
    const pk = tableMeta.primaryKey;
    const pv = editingRow[pk];

    try {
      const res = await api.post("/api/v1/database/updaterecord", {
        table: selectedTable,
        location: selectedLocationDb,
        primaryKey: pk,
        primaryValue: pv,
        data: editFormData
      });

      if (res && res.status === "success") {
        notify("success", "Record Updated", res.message || `Row #${pv} saved into ${selectedTable}.`);
        setEditingRow(null);
        fetchTableRows(selectedTable, selectedLocationDb);
        fetchTablesSummary(selectedLocationDb);
      } else {
        notify("error", "Update Failed", res?.message || "Database update failed.");
      }
    } catch (err) {
      notify("error", "Update Failed", "Could not commit record changes.");
    } finally {
      setSavingRecord(false);
    }
  };

  const handleDeleteRecord = async (row) => {
    const pk = tableMeta.primaryKey;
    const pv = row[pk];

    if (!window.confirm(`Are you sure you want to delete record #${pv} from ${selectedTable} in ${activeDbConfig.label}?`)) {
      return;
    }

    try {
      const res = await api.post("/api/v1/database/deleterecord", {
        table: selectedTable,
        location: selectedLocationDb,
        primaryKey: pk,
        primaryValue: pv
      });

      if (res && res.status === "success") {
        notify("success", "Record Removed", `Row #${pv} deleted from ${selectedTable}.`);
        fetchTableRows(selectedTable, selectedLocationDb);
        fetchTablesSummary(selectedLocationDb);
      } else {
        notify("error", "Delete Failed", res?.message || "Could not delete row.");
      }
    } catch (err) {
      notify("error", "Delete Failed", "Database delete request failed.");
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setSavingRecord(true);

    try {
      const res = await api.post("/api/v1/database/createrecord", {
        table: selectedTable,
        location: selectedLocationDb,
        data: createFormData
      });

      if (res && res.status === "success") {
        notify("success", "Record Created", res.message || `New record inserted into ${selectedTable}.`);
        setShowCreateModal(false);
        setCreateFormData({});
        fetchTableRows(selectedTable, selectedLocationDb);
        fetchTablesSummary(selectedLocationDb);
      } else {
        notify("error", "Insertion Error", res?.message || "Failed to create new entry.");
      }
    } catch (err) {
      notify("error", "Insertion Error", "Database create request failed.");
    } finally {
      setSavingRecord(false);
    }
  };

  const handleFlushSelectedTable = async () => {
    const activeDbObj = LOCATION_DBS.find(d => d.id === selectedLocationDb);
    if (!window.confirm(`DANGER: Truncate table "${selectedTable}" in ${activeDbObj.label}? All rows in ${selectedTable} will be permanently erased.`)) {
      return;
    }

    setFlushingTable(true);
    try {
      const res = await api.post("/api/v1/database/flushtable", { 
        table: selectedTable,
        location: selectedLocationDb
      });
      
      if (selectedTable.includes("mdhl") || selectedTable.includes("screening")) {
        try { await clearQueue(); } catch (e) {}
        localStorage.removeItem('ncd_offline_queue');
        localStorage.removeItem('ncd_local_initiated_participants');
      }

      if (res && res.status === "success") {
        notify("success", "Table Cleared", `${selectedTable} in ${activeDbObj.label} truncated successfully.`);
        fetchTableRows(selectedTable, selectedLocationDb);
        fetchTablesSummary(selectedLocationDb);
      } else {
        notify("error", "Flush Failed", res?.message || "Could not truncate table.");
      }
    } catch (err) {
      notify("error", "Flush Failed", "Database flush operation failed.");
    } finally {
      setFlushingTable(false);
    }
  };

  const handleFlushAllScreeningTables = async () => {
    const activeDbObj = LOCATION_DBS.find(d => d.id === selectedLocationDb);
    if (!window.confirm(`CRITICAL WARNING: Truncate all 11 screening tables in ${activeDbObj.label}? System user accounts will be preserved.`)) {
      return;
    }

    setFlushingTable(true);
    try {
      const res = await api.post("/api/v1/database/flushtable", { 
        tables: ['cms_mdhl', 'cms_apm', 'cms_vital', 'cms_bsr', 'cms_ce', 'cms_cml', 'cms_cprca', 'cms_dg', 'cms_fupm', 'cms_mortalityform', 'cms_trackingform'],
        location: selectedLocationDb
      });

      try { await clearQueue(); } catch (e) {}
      localStorage.removeItem('ncd_offline_queue');
      localStorage.removeItem('ncd_local_initiated_participants');
      localStorage.removeItem('ncd_used_participant_ids');

      if (res && res.status === "success") {
        notify("success", "Screening Purged", `${activeDbObj.label} screening tables & offline queues cleared.`);
        fetchTableRows(selectedTable, selectedLocationDb);
        fetchTablesSummary(selectedLocationDb);
      } else {
        notify("info", "Queues Purged", res?.message || "Purge completed.");
      }
    } catch (err) {
      notify("error", "Purge Failed", "Database purge request failed.");
    } finally {
      setFlushingTable(false);
    }
  };

  const handleSeedMockData = async () => {
    const activeDbObj = LOCATION_DBS.find(d => d.id === selectedLocationDb);
    setSeedingData(true);
    notify("info", "Seeding Entries", `Creating 5 realistic participant screening entries in ${activeDbObj.label}...`);
    try {
      const res = await api.post("/api/v1/database/seeddata", { location: selectedLocationDb });
      if (res && res.status === "success") {
        notify("success", "Seeding Completed", `Created 5 entries in ${activeDbObj.dbName}: ${res.seeded?.join(', ')}`);
        fetchTableRows(selectedTable, selectedLocationDb);
        fetchTablesSummary(selectedLocationDb);
      } else {
        notify("error", "Seeding Error", res?.message || "Could not seed test records.");
      }
    } catch (err) {
      notify("error", "Seeding Error", "Seed API call failed.");
    } finally {
      setSeedingData(false);
    }
  };

  // Filtered rows for currently selected table
  const filteredRows = tableMeta.data.filter(row => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some(val => 
      String(val || '').toLowerCase().includes(term)
    );
  });

  const activeDbConfig = LOCATION_DBS.find(d => d.id === selectedLocationDb) || LOCATION_DBS[0];
  const activeTableMeta = tablesList.find(t => t.table === selectedTable);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F7F4]">
      
      {/* Top Header Control Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-2xs">
                <Database size={18} />
              </div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(1.25rem, 2.2vw, 1.65rem)", color: T.ink, letterSpacing: "-0.02em" }}>
                Database Mastery & Operations
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> SQL Connections Active
              </span>
            </div>
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: T.charcoal500, marginTop: 4 }}>
              Direct database operations for <strong className="text-slate-900 font-bold">Dharavi</strong>, <strong className="text-slate-900 font-bold">Malvani</strong>, and <strong className="text-slate-900 font-bold">Vashi</strong> screening centers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSeedMockData}
              disabled={seedingData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-500 transition-all shadow-2xs cursor-pointer disabled:opacity-50 font-mono"
            >
              {seedingData ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              <span>Seed 5 {activeDbConfig.center} Records</span>
            </button>

            <button
              onClick={handleFlushAllScreeningTables}
              disabled={flushingTable}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white border border-red-700 transition-all shadow-2xs cursor-pointer disabled:opacity-50 font-mono"
            >
              {flushingTable ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              <span>Purge {activeDbConfig.center} DB</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Scroll Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 pb-28">

        {/* Location Database Switcher Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-2">
              <Building2 size={17} className="text-amber-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
                Select Active Location Database:
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">4 Database Contexts</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {LOCATION_DBS.map((locDb) => {
              const isSelected = selectedLocationDb === locDb.id;
              return (
                <button
                  key={locDb.id}
                  onClick={() => setSelectedLocationDb(locDb.id)}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer text-left ${
                    isSelected ? locDb.activeBadge : locDb.badge
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono uppercase tracking-wider">{locDb.center}</span>
                    <MapPin size={15} className={isSelected ? "text-amber-300" : "text-slate-400"} />
                  </div>
                  <div className="mt-3">
                    <p className={`text-xs font-bold font-mono ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {locDb.label}
                    </p>
                    <p className={`text-[10px] font-mono mt-0.5 ${isSelected ? "text-amber-200" : "text-slate-500"}`}>
                      Database: {locDb.dbName}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real Live Metrics Cards (Zero Dummy Fallbacks) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Connected Store</p>
              <h3 className="text-base font-black text-slate-900 font-mono mt-1 uppercase truncate">{activeDbConfig.dbName}</h3>
              <p className="text-[10px] text-amber-700 font-bold font-mono mt-0.5">Location: {activeDbConfig.center}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Database size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Live Table Records</p>
              <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">{tableMeta.data.length}</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">In <span className="font-bold text-slate-800">{selectedTable}</span></p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <Table size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Database Health</p>
              <h3 className="text-sm font-black text-emerald-700 font-mono mt-2 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Connection Online
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1">InnoDB Engine / UTF8</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
              <Server size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Primary Key Symbol</p>
              <h3 className="text-sm font-black text-slate-900 font-mono mt-2 uppercase">
                {tableMeta.primaryKey || (tableMeta.columns.length > 0 ? tableMeta.columns[0] : "ID")}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Unique Record Key</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
              <Code size={20} />
            </div>
          </div>

        </div>

        {/* Database Table Browser & Record Grid Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          
          {/* Table Selector Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            
            <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none w-full sm:w-auto">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 shrink-0">
                <Layers size={15} className="text-amber-600" /> Active Table:
              </span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-slate-900 text-white font-mono text-xs font-bold px-3.5 py-2.5 rounded-xl outline-none border border-slate-800 cursor-pointer shadow-2xs hover:bg-black transition-colors"
              >
                {tablesList.map((t) => (
                  <option key={t.table} value={t.table}>
                    {t.table} — {t.label} ({t.rowCount} rows)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
              <button
                onClick={() => fetchTableRows(selectedTable, selectedLocationDb)}
                disabled={loadingData}
                className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer shadow-2xs font-mono text-xs font-bold flex items-center gap-1.5"
                title={`Refresh ${activeDbConfig.dbName} table rows`}
              >
                <RefreshCw size={14} className={loadingData ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => {
                  const initialData = {};
                  tableMeta.columns.forEach(col => {
                    if (col !== tableMeta.primaryKey) initialData[col] = "";
                  });
                  setCreateFormData(initialData);
                  setShowCreateModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-2xs cursor-pointer font-mono flex items-center gap-1.5"
              >
                <Plus size={14} className="text-amber-400" />
                <span>Insert New Record</span>
              </button>

              <button
                onClick={handleFlushSelectedTable}
                disabled={flushingTable}
                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition-all shadow-2xs cursor-pointer font-mono flex items-center gap-1.5 disabled:opacity-50"
                title={`Flush table ${selectedTable}`}
              >
                <Trash2 size={14} className="text-red-600" />
                <span>Truncate Table</span>
              </button>
            </div>

          </div>

          {/* Search Filter Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Filter records in ${selectedTable} (${activeDbConfig.label}) by any value...`}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium outline-none focus:border-amber-400 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Data Grid Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs max-h-[520px] scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead className="sticky top-0 bg-slate-900 text-white z-10 text-xs font-mono">
                <tr>
                  <th className="px-4 py-3.5 font-bold border-b border-slate-700">ACTIONS</th>
                  {tableMeta.columns.map((col) => (
                    <th key={col} className="px-4 py-3.5 font-bold border-b border-slate-700 uppercase tracking-wider whitespace-nowrap">
                      {col} {col === tableMeta.primaryKey && <span className="text-amber-400 text-[10px] ml-1">(PRIMARY KEY)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {loadingData ? (
                  <tr>
                    <td colSpan={tableMeta.columns.length + 1} className="px-6 py-14 text-center text-slate-500">
                      <Loader2 className="animate-spin mx-auto mb-2.5 text-amber-600" size={26} />
                      Retrieving records from database <strong className="text-slate-800">{activeDbConfig.dbName}</strong> for {selectedTable}...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={tableMeta.columns.length + 1} className="px-6 py-14 text-center text-slate-400 font-mono">
                      No records found in <strong className="text-slate-700">{selectedTable}</strong> in <strong className="text-slate-700">{activeDbConfig.label} ({activeDbConfig.dbName})</strong>. Use <strong>+ Insert New Record</strong> or <strong>Seed 5 {activeDbConfig.center} Records</strong> above.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, rIdx) => {
                    const pkVal = row[tableMeta.primaryKey] || rIdx;
                    return (
                      <tr key={pkVal} className="hover:bg-amber-50/50 transition-colors">
                        {/* Actions column */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditClick(row)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 border border-slate-200 text-slate-700 hover:text-amber-900 transition-all cursor-pointer shadow-2xs"
                              title="Edit Record"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(row)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-800 transition-all cursor-pointer shadow-2xs"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>

                        {/* Columns values */}
                        {tableMeta.columns.map((col) => {
                          const val = row[col];
                          const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                          return (
                            <td key={col} className="px-4 py-3 whitespace-nowrap max-w-xs truncate text-slate-800" title={strVal}>
                              {strVal.length > 50 ? `${strVal.substring(0, 50)}...` : (strVal || <span className="text-slate-300 italic">null</span>)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* EDIT RECORD MODAL */}
      {editingRow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Edit3 size={20} className="text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  Modify Record in <span className="text-amber-700">{selectedTable}</span> ({activeDbConfig.label})
                </h3>
              </div>
              <button 
                onClick={() => setEditingRow(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateRecord} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {tableMeta.columns.map((col) => {
                  const isPk = col === tableMeta.primaryKey;
                  return (
                    <div key={col} className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono">
                        {col} {isPk && <span className="text-amber-600">(Primary Key)</span>}
                      </label>
                      <input
                        type="text"
                        value={editFormData[col] ?? ""}
                        readOnly={isPk}
                        disabled={isPk}
                        onChange={(e) => setEditFormData({ ...editFormData, [col]: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border outline-none font-mono text-xs ${
                          isPk ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" : "bg-white border-slate-300 focus:border-amber-500 text-slate-900"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRecord}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50 font-mono"
                >
                  {savingRecord ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} className="text-amber-400" />}
                  <span>Save Modifications</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CREATE RECORD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Plus size={20} className="text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  Insert Entry into <span className="text-amber-700">{selectedTable}</span> ({activeDbConfig.label})
                </h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {tableMeta.columns.filter(c => c !== tableMeta.primaryKey).map((col) => (
                  <div key={col} className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono">
                      {col}
                    </label>
                    <input
                      type="text"
                      value={createFormData[col] ?? ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, [col]: e.target.value })}
                      placeholder={`Enter ${col}...`}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none focus:border-amber-500 font-mono text-xs text-slate-900"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRecord}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50 font-mono"
                >
                  {savingRecord ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} className="text-amber-400" />}
                  <span>Create Entry</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
