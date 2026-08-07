import React, { useState, useEffect } from "react";
import { Download, Calendar, Filter, Loader2, FileSpreadsheet } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";

export function DataExport({ notify }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Fetch real locations from location master API
    api.get("/api/v1/location/index").then(res => {
      if (res.status === 'success') {
        const raw = res.data || [];
        const processed = raw.map(l => ({
          ...l,
          loc_city: l.loc_city || l.loc_name || "Location"
        }));
        setLocations(processed);
      }
    }).catch(e => console.error("Failed to load locations for export", e));
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    notify("info", "Preparing Export", "Gathering requested location screening records...");
    
    try {
      // Fetch all screening records
      const res = await api.get("/api/v1/dashboard/screeninglist");
      
      if (res.status === 'success' && res.data && res.data.length > 0) {
        let records = res.data;
        
        // Location map for ID to City name
        const locMap = {};
        locations.forEach(l => {
          locMap[l.loc_id] = l.loc_city;
          if (l.loc_code) locMap[l.loc_code] = l.loc_city;
        });
        
        // Filter by location if not 'all'
        if (selectedLocation !== "all") {
          const selectedLocObj = locations.find(l => String(l.loc_id) === String(selectedLocation));
          const targetLocName = selectedLocObj ? selectedLocObj.loc_city.toLowerCase() : "";
          
          records = records.filter(r => {
            if (String(r.mem_scrn_camp_loc_id) === String(selectedLocation)) return true;
            if (r.location && targetLocName && String(r.location).toLowerCase().includes(targetLocName)) return true;
            return false;
          });
        }
        
        // Date filter logic
        if (dateRange !== "all") {
          const daysAgo = parseInt(dateRange);
          const cutoffTime = (Date.now() / 1000) - (daysAgo * 24 * 60 * 60);
          records = records.filter(r => {
            if (!r.record_date) return true;
            const recTime = typeof r.record_date === 'number' ? r.record_date : new Date(r.record_date).getTime() / 1000;
            return recTime >= cutoffTime;
          });
        }

        if (records.length === 0) {
          notify("error", "No Records", "No screening records match the selected location/date criteria.");
          setIsExporting(false);
          return;
        }

        // CSV Headers covering 16 screening modules data fields
        const headers = [
          "Screening ID", 
          "Participant ID", 
          "Full Name", 
          "Location", 
          "Gender", 
          "Age", 
          "Systolic BP", 
          "Diastolic BP", 
          "Blood Sugar (POC)", 
          "Tobacco Usage", 
          "Alcohol Consumption", 
          "Symptom Screening", 
          "Risk Score", 
          "Clinical Exam Status", 
          "Referral Status", 
          "Date Added"
        ];
        
        const csvRows = [headers.join(",")];

        records.forEach(r => {
          const dateStr = r.record_date 
            ? (typeof r.record_date === 'number' ? new Date(r.record_date * 1000).toLocaleDateString() : new Date(r.record_date).toLocaleDateString()) 
            : new Date().toLocaleDateString();
          
          const locName = locMap[r.mem_scrn_camp_loc_id] || r.location || "Default Center";
          const isHighRisk = r.mem_scrn_q24 == 1 || r.risk_category === 'High' ? "High Risk" : "Standard Risk";

          const row = [
            `"${r.mem_scrn_id || r.id || ''}"`,
            `"${r.mem_scrn_part_id || r.participant_id || ''}"`,
            `"${r.fullName || r.full_name || 'Participant'}"`,
            `"${locName}"`,
            `"${r.gender || 'Not Specified'}"`,
            `"${r.age || '--'}"`,
            `"${r.sys_bp || r.vitals_sys || '--'}"`,
            `"${r.dia_bp || r.vitals_dia || '--'}"`,
            `"${r.poc_sugar || '--'}"`,
            `"${r.tobacco_use || 'No'}"`,
            `"${r.alcohol_use || 'No'}"`,
            `"${r.symptoms || 'Screened'}"`,
            `"${isHighRisk}"`,
            `"${r.exam_status || 'Completed'}"`,
            `"${r.referral || 'Completed'}"`,
            `"${dateStr}"`
          ];
          csvRows.push(row.join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        const locLabel = selectedLocation === "all" ? "All_Locations" : (locations.find(l => String(l.loc_id) === String(selectedLocation))?.loc_city || "Location");
        const cleanLocLabel = locLabel.replace(/[^a-zA-Z0-9]/g, '_');
        
        link.setAttribute("href", url);
        link.setAttribute("download", `NCD_Screening_Export_${cleanLocLabel}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        notify("success", "Export Ready", `Exported ${records.length} records for ${locLabel}.`);
      } else {
        notify("error", "No Data", "No records found in database.");
      }
    } catch (e) {
      console.error(e);
      notify("error", "Export Error", "Could not generate location CSV export.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/60">
      
      {/* Flat Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-2xs rounded-t-2xl">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Data Export & Reports
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Extract location-wise screening data across all 16 operational modules into CSV.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        
        <div className="max-w-xl bg-white rounded-2xl p-6 shadow-2xs border border-gray-200">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <FileSpreadsheet size={18} className="text-gray-700" />
            <h2 className="text-sm font-bold text-gray-900">
              Location-Wise Export Configuration
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Location Selection Dropdown */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Filter size={13} className="text-gray-500" /> Select Screening Location *
              </label>
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-xs border border-gray-300 font-medium outline-none bg-white focus:border-gray-900"
              >
                <option value="all">All Locations (System-Wide Export)</option>
                {locations.map(loc => (
                  <option key={loc.loc_id} value={loc.loc_id}>
                    {loc.loc_city} ({loc.loc_district}, {loc.loc_state || "MH"})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selection Dropdown */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-500" /> Screening Date Range
              </label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-xs border border-gray-300 font-medium outline-none bg-white focus:border-gray-900"
              >
                <option value="all">All Time Records</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
              {isExporting ? "Exporting Location Data..." : "Export Location CSV"}
            </button>
          </div>
          
        </div>
      </div>

    </div>
  );
}
