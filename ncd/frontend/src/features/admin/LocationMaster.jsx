import React, { useState, useEffect } from "react";
import { Plus, Search, MapPin, Edit2, Trash2, Shield, Check, X, Loader2 } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";

export function LocationMaster({ notify }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    loc_id: "",
    loc_code: "",
    loc_name: "",
    loc_state: "Maharashtra",
    loc_district: "Mumbai",
    loc_city: "",
    loc_status: "1"
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/location/index");
      if (res.status === 'success') {
        const rawLocs = res.data || [];
        const processed = rawLocs.map(l => ({
          ...l,
          loc_city: l.loc_city || l.loc_name || "Unknown Center",
          loc_district: l.loc_district || "Mumbai",
          loc_state: l.loc_state || "Maharashtra"
        }));
        setLocations(processed);

        // Store location prefixes in localStorage for participant ID generation
        try {
          const prefixMap = { dharavi: "DH", malvani: "ML", vashi: "VA", other: "OT" };
          processed.forEach(loc => {
            const nameKey = String(loc.loc_city || loc.loc_name || "").toLowerCase().trim();
            const codeVal = String(loc.loc_code || "").trim().toUpperCase();
            if (nameKey && codeVal) {
              prefixMap[nameKey] = codeVal;
            }
          });
          localStorage.setItem('ncd_location_prefixes', JSON.stringify(prefixMap));
        } catch (e) {}
      }
    } catch (e) {
      console.error(e);
      notify("error", "Error", "Failed to fetch locations.");
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (val) => {
    const autoCode = val ? val.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase() : "";
    setFormData(prev => ({
      ...prev,
      loc_city: val,
      loc_name: val,
      loc_code: prev.loc_code || autoCode
    }));
  };

  const handleEdit = (loc) => {
    setEditingId(loc.loc_id);
    setFormData({
      loc_id: loc.loc_id,
      loc_code: loc.loc_code || "",
      loc_name: loc.loc_name || loc.loc_city || "",
      loc_state: loc.loc_state || "Maharashtra",
      loc_district: loc.loc_district || "Mumbai",
      loc_city: loc.loc_city || loc.loc_name || "",
      loc_status: loc.loc_status || loc.status || "1"
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        const res = await api.delete(`/api/v1/location/delete?id=${id}`);
        if (res.status === 'success') {
          notify("success", "Deleted", "Location removed successfully.");
          fetchLocations();
        }
      } catch (e) {
        notify("error", "Error", "Failed to delete location.");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.loc_city) {
      notify("error", "Incomplete", "Please enter the City/Town or Center name.");
      return;
    }

    const city = formData.loc_city.trim();
    let code = formData.loc_code.trim().toUpperCase();
    if (!code || code.length < 2) {
      code = city.replace(/[^A-Z]/gi, '').substring(0, 2).toUpperCase();
      if (code.length < 2) code = "DH";
    }

    const payload = {
      loc_code: code,
      loc_name: city,
      state_code: (formData.loc_state || "MH").substring(0, 2).toUpperCase(),
      loc_state: formData.loc_state || "Maharashtra",
      loc_district: formData.loc_district || "Mumbai",
      loc_city: city,
      loc_status: formData.loc_status || "1",
      status: formData.loc_status || "1"
    };

    try {
      if (editingId) {
        const res = await api.put(`/api/v1/location/update?id=${editingId}`, payload);
        if (res.status === 'success') {
          notify("success", "Updated", "Location updated successfully.");
        }
      } else {
        const res = await api.post("/api/v1/location/create", payload);
        if (res.status === 'success') {
          notify("success", "Created", "New screening location added successfully.");
        }
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ loc_id: "", loc_code: "", loc_name: "", loc_state: "Maharashtra", loc_district: "Mumbai", loc_city: "", loc_status: "1" });
      fetchLocations();
    } catch (e) {
      console.error(e);
      notify("error", "Error", e.message || "Failed to save location.");
    }
  };

  const filteredLocations = locations.filter(l => 
    (l.loc_city && l.loc_city.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (l.loc_name && l.loc_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (l.loc_district && l.loc_district.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.loc_code && l.loc_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/60">
      
      {/* Flat Sticky Header Without Awkward Rounded Corners */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Location Master
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage screening camp locations and regional centers across Mumbai & Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm">
            <Search size={15} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search center, code or district..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-xs w-52 text-gray-800"
            />
          </div>
          
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ loc_id: "", loc_code: "", loc_name: "", loc_state: "Maharashtra", loc_district: "Mumbai", loc_city: "", loc_status: "1" });
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={15} />
            Add Location
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        
        {loading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
            No locations found matching search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLocations.map((loc) => (
              <div 
                key={loc.loc_id}
                className="rounded-2xl p-5 shadow-2xs transition-all hover:shadow-sm relative group bg-white border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs">
                      {loc.loc_code || "LC"}
                    </div>
                    <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(loc)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 border border-gray-200"
                        title="Edit Location"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => handleDelete(loc.loc_id)}
                        className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-red-600 border border-red-200"
                        title="Delete Location"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mb-1 truncate">
                    {loc.loc_city || loc.loc_name || "Camp Location"}
                  </h3>
                  
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <p><span className="font-medium text-gray-700">District:</span> {loc.loc_district || "Mumbai"}</p>
                    <p><span className="font-medium text-gray-700">State:</span> {loc.loc_state || "Maharashtra"}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Code: {loc.loc_code || "--"}</span>
                  {loc.loc_status == "1" || loc.status == "1" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <Check size={13} /> Active Location
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                      <Shield size={13} /> Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">
                {editingId ? "Edit Location" : "Add New Location"}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  City / Location Name *
                </label>
                <input 
                  type="text" 
                  value={formData.loc_city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  placeholder="e.g. Dharavi, Malvani, Vashi"
                  className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  2-Letter Location Code (e.g., DH, ML, VA)
                </label>
                <input 
                  type="text" 
                  maxLength={2}
                  value={formData.loc_code}
                  onChange={(e) => setFormData({...formData, loc_code: e.target.value.toUpperCase()})}
                  placeholder="Auto-generated if blank"
                  className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900 uppercase font-mono font-bold"
                />
              </div>
              
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  District
                </label>
                <input 
                  type="text" 
                  value={formData.loc_district}
                  onChange={(e) => setFormData({...formData, loc_district: e.target.value})}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  State
                </label>
                <input 
                  type="text" 
                  value={formData.loc_state}
                  onChange={(e) => setFormData({...formData, loc_state: e.target.value})}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select 
                  value={formData.loc_status}
                  onChange={(e) => setFormData({...formData, loc_status: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg text-xs border border-gray-300 outline-none bg-white font-medium"
                >
                  <option value="1">Active Location</option>
                  <option value="0">Inactive Location</option>
                </select>
              </div>
            </div>

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
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
