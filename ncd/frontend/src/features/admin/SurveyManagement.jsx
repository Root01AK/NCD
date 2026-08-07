import React, { useState, useEffect } from "react";
import { Search, Plus, FileText, Play, BarChart2, Copy, Loader2, Settings, Trash2 } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";

export function SurveyManagement({ notify, setNavTab, setSelectedSurvey }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/surveymaster/index");
      if (res.status === 'success') {
        setSurveys(res.data);
      }
    } catch (e) {
      console.error(e);
      notify("error", "Error", `Failed to load surveys: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (survey) => {
    try {
      notify("info", "Duplicating...", "Creating survey replica.");
      const res = await api.post("/api/v1/surveymaster/create", {
        sur_title: `${survey.sur_title} (Copy)`,
        sur_code: `S-${Date.now().toString().slice(-4)}`,
        sur_url: survey.sur_url || "",
        sur_onlne_id: survey.sur_onlne_id || "NCD-ONL",
        sur_pri_db_name: survey.sur_pri_db_name || "ncd_local",
        sur_pri_db_server: survey.sur_pri_db_server || "localhost",
        sur_pri_db_usrnme: survey.sur_pri_db_usrnme || "root",
        sur_pri_db_paswrd: survey.sur_pri_db_paswrd || "",
        status: "1"
      });
      
      if (res.status === 'success') {
        notify("success", "Success", "Survey duplicated successfully.");
        fetchSurveys();
      } else {
        const errMsg = res.errors ? Object.values(res.errors).flat().join(", ") : "Validation failed.";
        notify("error", "Error", `Failed to duplicate: ${errMsg}`);
      }
    } catch (e) {
      console.error(e);
      notify("error", "Error", "Failed to duplicate survey.");
    }
  };

  const handleDelete = async (survey) => {
    if (!window.confirm(`Are you sure you want to delete "${survey.sur_title}"?`)) return;
    try {
      notify("info", "Deleting...", "Removing survey.");
      const res = await api.put(`/api/v1/surveymaster/update/${survey.sur_id}`, {
        status: "0"
      });
      if (res.status === 'success') {
        notify("success", "Deleted", "Survey removed successfully.");
        fetchSurveys();
      } else {
        notify("error", "Error", "Failed to delete survey.");
      }
    } catch (e) {
      console.error(e);
      notify("error", "Error", "Failed to delete survey.");
    }
  };

  const filteredSurveys = surveys.filter(s => 
    s.sur_title && s.sur_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50 relative">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-2xs">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, color: T.ink, letterSpacing: "-0.02em" }}>
            Survey Management
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: T.charcoal500, marginTop: 2 }}>
            Deploy screening forms to the field.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-sm"
            style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}
          >
            <Search size={16} color={T.charcoal500} />
            <input 
              type="text" 
              placeholder="Search surveys..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-48"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
            />
          </div>
          
          <button 
            onClick={() => setNavTab("survey-builder")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-transform active:scale-95 shadow-sm hover:shadow-md"
            style={{ background: T.ink, color: T.gold }}
          >
            <Plus size={16} />
            New Survey
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            No surveys found.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredSurveys.map((s) => (
              <div 
                key={s.sur_id}
                className="rounded-3xl p-6 shadow-sm transition-transform hover:-translate-y-1 bg-white border flex flex-col"
                style={{ borderColor: T.line }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 border" style={{ borderColor: T.line }}>
                      <FileText size={20} color={T.ink} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: T.ink }}>
                        {s.sur_title}
                      </h3>
                      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.charcoal500, marginTop: 2 }}>
                        ID: {s.sur_id}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Survey
                  </span>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t" style={{ borderColor: T.line }}>
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: T.charcoal500 }}>Location Context</span>
                      <span className="text-sm font-medium" style={{ color: T.ink }}>{s.location || 'All Locations'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedSurvey(s);
                        setNavTab("survey-builder");
                      }}
                      className="p-2 rounded-full hover:bg-gray-50 transition-colors border"
                      style={{ borderColor: T.line, color: T.charcoal700 }}
                      title="Edit Schema"
                    >
                      <Settings size={16} />
                    </button>
                    <button 
                      onClick={() => setNavTab("dashboard")}
                      className="p-2 rounded-full hover:bg-gray-50 transition-colors border"
                      style={{ borderColor: T.line, color: T.charcoal700 }}
                      title="View Responses"
                    >
                      <BarChart2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDuplicate(s)}
                      className="p-2 rounded-full hover:bg-gray-50 transition-colors border"
                      style={{ borderColor: T.line, color: T.charcoal700 }}
                      title="Duplicate Survey"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(s)}
                      className="p-2 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors border"
                      style={{ borderColor: T.line, color: T.charcoal700 }}
                      title="Delete Survey"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
