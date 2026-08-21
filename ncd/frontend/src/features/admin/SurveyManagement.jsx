import React, { useState, useEffect } from "react";
import { Search, Plus, FileText, Play, BarChart2, Copy, Loader2, Settings, Trash2, BookOpen, Edit, SlidersHorizontal, Layers, Eye, ClipboardList, ClipboardCheck, Stethoscope, Menu } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";
import { getDefaultSkipRulesForQuestion } from "../../lib/logicEngine";

export function SurveyManagement({ notify, setNavTab, setSelectedSurvey, onOpenMobileMenu }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingCodebookSurvey, setViewingCodebookSurvey] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const apiPromise = api.get("/api/v1/surveymaster/index");
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 800));
        const res = await Promise.race([apiPromise, timeoutPromise]);
        if (isMounted) {
          if (res && res.status === 'success' && Array.isArray(res.data)) {
            setSurveys(res.data);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

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
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "clamp(1.1rem, 2vw, 1.5rem)", color: T.ink, letterSpacing: "-0.02em" }}>
                Survey Management
              </h1>
              <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: T.charcoal500, marginTop: 1 }}>
                Deploy screening forms to the field.
              </p>
            </div>
          </div>

          <button 
            onClick={() => {
              setSelectedSurvey(null);
              setNavTab("survey-builder");
            }}
            className="sm:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-sm"
            style={{ background: T.ink, color: T.gold }}
          >
            <Plus size={15} />
            <span>New</span>
          </button>
        </div>

        <button 
          onClick={() => {
            setSelectedSurvey(null);
            setNavTab("survey-builder");
          }}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
          style={{ background: T.ink, color: T.gold }}
        >
          <Plus size={16} />
          <span>New Survey</span>
        </button>
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
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100 border border-amber-300/80 shadow-2xs">
                      <ClipboardCheck size={22} className="text-amber-900" />
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

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
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
                  
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button 
                      onClick={() => setViewingCodebookSurvey(s)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs font-mono"
                      title="View Option Codebook"
                    >
                      <BookOpen size={13} className="text-amber-800" />
                      <span>Codebook</span>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedSurvey(s);
                        setNavTab("survey-builder");
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Edit Survey Schema"
                    >
                      <Edit size={13} className="text-slate-700" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => setNavTab("dashboard")}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="View Survey Responses"
                    >
                      <BarChart2 size={13} className="text-slate-700" />
                      <span>Results</span>
                    </button>
                    <button 
                      onClick={() => handleDuplicate(s)}
                      className="p-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 text-slate-700 cursor-pointer"
                      title="Duplicate Survey"
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(s)}
                      className="p-2 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors border border-slate-200 text-slate-500 cursor-pointer"
                      title="Delete Survey"
                    >
                      <Trash2 size={14} />
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
                {/* Active Skip & Branching Logic Rules */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-mono space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-amber-900 flex items-center gap-1.5">
                    ⚙️ Active Skip & Branching Logic Rules:
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] font-medium text-amber-900/90">
                    <li><strong>Rule 1 (Q11):</strong> If Q11 is opted to Code 2 or 3 → <em>Skip Q12 (Jump straight to Q13)</em>.</li>
                    <li><strong>Rule 2 (Q14):</strong> If Q14 is opted to Code 2 → <em>Skip Q15 & Q16 (Jump straight to Q17)</em>.</li>
                    <li><strong>Rule 3 (Q17):</strong>
                      <div className="pl-2 mt-0.5 space-y-0.5">
                        <p>• Code 1 → <em>Skip Q18 to Q23 (Jump straight to Q24)</em></p>
                        <p>• Code 2 → <em>Answer Q18 & Q19, Skip Q20 to Q23 (Jump to Q24)</em></p>
                        <p>• Code 3 → <em>Skip Q18 & Q19, Answer Q20 to Q23</em></p>
                      </div>
                    </li>
                    <li><strong>Rule 4 (Q25):</strong>
                      <div className="pl-2 mt-0.5 space-y-0.5">
                        <p>• Code 1 → <em>Skip Q26 to Q32 (Jump to Q33)</em></p>
                        <p>• Code 2 → <em>Answer Q26, Skip Q27 to Q32 (Jump to Q33)</em></p>
                        <p>• Code 3 → <em>Skip Q26, Answer Q27 onwards</em></p>
                      </div>
                    </li>
                    <li><strong>Rule 5 (Q30 AUDIT-C Score):</strong> If below threshold (Male &lt; 4, Female/Trans &lt; 3) → <em>Skip Q31 & Q32 (Jump to Q33)</em>. If positive, administer full AUDIT.</li>
                    <li><strong>Rule 6 (Q33):</strong>
                      <div className="pl-2 mt-0.5 space-y-0.5">
                        <p>• Code 1 or 5 → <em>Skip Q34 to Q36 (Jump to Q37)</em></p>
                        <p>• Code 2 or 3 → <em>Answer Q34, Skip Q35 & Q36 (Jump to Q37)</em></p>
                        <p>• Code 4 → <em>Answer Q34 to Q36</em></p>
                      </div>
                    </li>
                    <li><strong>Rule 7 (Q40):</strong> If Q40 is opted to Code 2 → <em>Skip Q41 (Jump to Q42)</em>.</li>
                    <li><strong>Rule 8 (Q43):</strong> If Q43 is opted to Code 2 → <em>Skip to Q44</em>.</li>
                    <li><strong>Rule 9 (Q44):</strong> If Q44 is opted to Code 2 → <em>Skip Q45 (Jump to Q46)</em>.</li>
                    <li><strong>Rule 10 (Q46):</strong> If Q46 is opted to Code 2 → <em>Skip Q47 (Jump to Q48)</em>.</li>
                    <li><strong>Rule 11 (Q58 & Q59):</strong> Q58 Code 2/3 → <em>Skip Q59 (Jump to Q60)</em>. Q59 Code 2/3 → <em>Skip Q60 (Jump to Q61)</em>. Both Q58 & Q59 0/1 → <em>Skip Q65</em>.</li>
                    <li><strong>Rule 12 (Q81):</strong> If NOT Code 6 → <em>Skip Q83</em>.</li>
                    <li><strong>Rule 13 (Q88 BMI):</strong> Only if BMI &lt; 20. If BMI &ge; 20 → <em>Skip to Q89</em>.</li>
                    <li><strong>Rule 14 (Q94):</strong> If Code 2 → <em>Skip to Section 15</em>.</li>
                    <li><strong>Rule 15 (Q97):</strong> If Code 1 → <em>Skip to Q107 & close remaining attempts</em>; otherwise proceed to Attempt 2.</li>
                    <li><strong>Rule 16 (Q103):</strong> If Code 1 → <em>Go to Q107</em>. Any other outcome closes record as Lost to Follow-up & makes Q104 compulsory (Max 3 attempts, no 4th attempt).</li>
                  </ul>
                </div>

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
                    const qRules = Array.isArray(q.skipRules) && q.skipRules.length > 0
                      ? q.skipRules
                      : (q.skipRule && q.skipRule.dependsOn ? [q.skipRule] : getDefaultSkipRulesForQuestion(q.title || q.id));

                    return (
                      <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-900 font-mono">{q.title || `Question ${idx + 1}`}</h4>
                            {qRules.length > 0 && (
                              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1">
                                <span>⚡ {qRules.length} Skip Logic:</span>
                                <em>{qRules[0].description || `If ${qRules[0].dependsOn} is ${qRules[0].value} → ${qRules[0].action}`}</em>
                              </span>
                            )}
                          </div>
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
