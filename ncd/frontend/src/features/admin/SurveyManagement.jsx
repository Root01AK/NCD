import React, { useState, useEffect } from "react";
import { Search, Plus, FileText, Play, BarChart2, Copy, Loader2, Settings, Trash2 } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";

export function SurveyManagement({ notify, setNavTab, setSelectedSurvey }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingCodebookSurvey, setViewingCodebookSurvey] = useState(null);

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
                      onClick={() => setViewingCodebookSurvey(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs font-mono"
                      title="View Option Codebook"
                    >
                      <FileText size={13} className="text-amber-600" />
                      <span>Codebook</span>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedSurvey(s);
                        setNavTab("survey-builder");
                      }}
                      className="p-2 rounded-full hover:bg-gray-50 transition-colors border cursor-pointer"
                      style={{ borderColor: T.line, color: T.charcoal700 }}
                      title="Edit Schema"
                    >
                      <Settings size={16} />
                    </button>
                    <button 
                      onClick={() => setNavTab("dashboard")}
                      className="p-2 rounded-full hover:bg-gray-50 transition-colors border cursor-pointer"
                      style={{ borderColor: T.line, color: T.charcoal700 }}
                      title="View Responses"
                    >
                      <BarChart2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDuplicate(s)}
                      className="p-2 rounded-full hover:bg-gray-50 transition-colors border cursor-pointer"
                      style={{ borderColor: T.line, color: T.charcoal700 }}
                      title="Duplicate Survey"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(s)}
                      className="p-2 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors border cursor-pointer"
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

        {/* Option Codebook Modal */}
        {viewingCodebookSurvey && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{viewingCodebookSurvey.sur_title}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 font-mono">Survey Option Codebook</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">Numeric response codes (1, 2, 3, 11, 16...) for field data validation.</p>
                </div>
                <button 
                  onClick={() => setViewingCodebookSurvey(null)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {(() => {
                  let schemaQs = [];
                  if (viewingCodebookSurvey.sur_url) {
                    try {
                      schemaQs = JSON.parse(viewingCodebookSurvey.sur_url);
                    } catch (e) {}
                  }
                  if (!Array.isArray(schemaQs) || schemaQs.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-400 font-mono text-xs">
                        No custom schema JSON found for this survey form.
                      </div>
                    );
                  }

                  return schemaQs.map((q, idx) => {
                    const opts = Array.isArray(q.options) ? q.options : [];
                    return (
                      <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 font-mono">{q.title || `Question ${idx + 1}`}</h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">{q.type}</span>
                        </div>
                        {opts.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">Direct Text / Number response field (No option codes)</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {opts.map((opt, oIdx) => {
                              const labelVal = typeof opt === 'object' && opt !== null ? opt.label : String(opt);
                              const codeVal = typeof opt === 'object' && opt !== null ? (opt.code ?? String(oIdx + 1)) : String(oIdx + 1);
                              return (
                                <div key={oIdx} className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs">
                                  <span className="text-slate-800 font-medium">{labelVal}</span>
                                  <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px]">Code {codeVal}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setViewingCodebookSurvey(null)}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close Codebook
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
