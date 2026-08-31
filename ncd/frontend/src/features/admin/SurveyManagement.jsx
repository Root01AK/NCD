import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, FileText, Play, BarChart2, Copy, Loader2, Settings, Trash2, BookOpen, Edit, SlidersHorizontal, Layers, Eye, ClipboardList, ClipboardCheck, Stethoscope, Menu, Download, Upload, FileJson, Check, CopyCheck, Code, Share2, Sparkles, X } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";
import { getDefaultSkipRulesForQuestion } from "../../lib/logicEngine";

export function SurveyManagement({ notify, setNavTab, setSelectedSurvey, onOpenMobileMenu }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingCodebookSurvey, setViewingCodebookSurvey] = useState(null);
  const [previewingSurvey, setPreviewingSurvey] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pastedJson, setPastedJson] = useState("");
  const [importSurveyTitle, setImportSurveyTitle] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const jsonFileInputRef = useRef(null);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/surveymaster/index");
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        setSurveys(res.data);
      } else {
        setSurveys([]);
      }
    } catch (e) {
      console.error(e);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const getSurveySchemaObj = (s) => {
    let schemaArr = [];
    if (s.sur_url) {
      try {
        const parsed = JSON.parse(s.sur_url);
        if (Array.isArray(parsed)) schemaArr = parsed;
        else if (parsed.schema && Array.isArray(parsed.schema)) schemaArr = parsed.schema;
        else if (parsed.questions && Array.isArray(parsed.questions)) schemaArr = parsed.questions;
      } catch (e) {}
    }
    if (schemaArr.length === 0) {
      try {
        const activeStr = localStorage.getItem('ncd_active_survey_questions');
        if (activeStr) {
          const parsed = JSON.parse(activeStr);
          if (Array.isArray(parsed)) schemaArr = parsed;
        }
      } catch (e) {}
    }
    return {
      sur_title: s.sur_title || "Survey Schema",
      sur_code: s.sur_code || "S-001",
      exported_at: new Date().toISOString(),
      version: "1.0",
      questions: schemaArr
    };
  };

  const copySurveyJson = (s) => {
    try {
      const schemaData = getSurveySchemaObj(s);
      const jsonStr = JSON.stringify(schemaData, null, 2);
      navigator.clipboard.writeText(jsonStr);
      setCopiedId(s.sur_id);
      setTimeout(() => setCopiedId(null), 2500);
      if (notify) notify("success", "Copied to Clipboard!", `Survey JSON schema for "${s.sur_title}" copied! You can now paste this JSON directly in Production.`);
    } catch (e) {
      console.error(e);
      if (notify) notify("error", "Copy Failed", "Could not copy survey JSON to clipboard.");
    }
  };

  const downloadSurveyJson = (s) => {
    try {
      const schemaData = getSurveySchemaObj(s);
      const jsonStr = JSON.stringify(schemaData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(s.sur_title || "survey").toLowerCase().replace(/[^a-z0-9]/g, "_")}_schema.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (notify) notify("success", "Downloaded!", `Exported "${s.sur_title}" JSON schema file.`);
    } catch (e) {
      console.error(e);
      if (notify) notify("error", "Download Failed", "Could not export survey JSON file.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const parsed = JSON.parse(text);
        setPastedJson(JSON.stringify(parsed, null, 2));
        if (parsed.sur_title && !importSurveyTitle) {
          setImportSurveyTitle(parsed.sur_title);
        }
        if (notify) notify("success", "File Loaded", `Loaded JSON file "${file.name}" with ${Array.isArray(parsed) ? parsed.length : (parsed.questions ? parsed.questions.length : 0)} questions.`);
      } catch (err) {
        if (notify) notify("error", "Invalid File", "Uploaded file is not a valid JSON document.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportJsonSubmit = async () => {
    if (!pastedJson.trim()) {
      if (notify) notify("error", "Invalid Input", "Please paste valid JSON survey schema content.");
      return;
    }
    try {
      const parsed = JSON.parse(pastedJson.trim());
      let title = importSurveyTitle.trim() || parsed.sur_title || "Imported Survey";
      let questionsArr = [];

      if (Array.isArray(parsed)) {
        questionsArr = parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questionsArr = parsed.questions;
      } else if (parsed.schema && Array.isArray(parsed.schema)) {
        questionsArr = parsed.schema;
      } else {
        if (notify) notify("error", "Invalid Schema", "JSON must contain an array of question objects or a schema wrapper object.");
        return;
      }

      if (questionsArr.length === 0) {
        if (notify) notify("error", "Empty Questions", "The imported JSON contains no questions.");
        return;
      }

      if (notify) notify("info", "Importing...", "Saving survey schema to database...");

      const res = await api.post("/api/v1/surveymaster/create", {
        sur_title: title,
        sur_code: `S-${Date.now().toString().slice(-4)}`,
        sur_url: JSON.stringify(questionsArr),
        sur_onlne_id: "NCD-ONL",
        sur_pri_db_name: "ncd_local",
        sur_pri_db_server: "localhost",
        sur_pri_db_usrnme: "root",
        sur_pri_db_paswrd: "",
        status: "1"
      });

      if (res && res.status === 'success') {
        if (notify) notify("success", "Survey Imported!", `Successfully imported "${title}" with ${questionsArr.length} questions into Production.`);
        setShowImportModal(false);
        setPastedJson("");
        setImportSurveyTitle("");
        fetchSurveys();
      } else {
        const errMsg = res && res.message ? res.message : (res && res.errors ? Object.values(res.errors).flat().join(", ") : "Validation error");
        if (notify) notify("error", "Import Failed", errMsg);
      }
    } catch (err) {
      console.error(err);
      if (notify) notify("error", "JSON Parse Error", "Syntax error in pasted JSON. Please verify valid JSON formatting.");
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

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 transition-all cursor-pointer shadow-2xs font-mono"
              title="Paste JSON from Localhost to deploy in Production"
            >
              <Upload size={14} className="text-amber-800" />
              <span>Import / Paste JSON</span>
            </button>
            <button 
              onClick={() => {
                setSelectedSurvey(null);
                setNavTab("survey-builder");
              }}
              className="sm:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-sm cursor-pointer"
              style={{ background: T.ink, color: T.gold }}
            >
              <Plus size={15} />
              <span>New</span>
            </button>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 transition-all cursor-pointer shadow-2xs font-mono"
            title="Paste JSON from Localhost to deploy in Production"
          >
            <FileJson size={15} className="text-amber-800" />
            <span>Paste / Import Survey JSON</span>
          </button>
          <button 
            onClick={() => {
              setSelectedSurvey(null);
              setNavTab("survey-builder");
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
            style={{ background: T.ink, color: T.gold }}
          >
            <Plus size={16} />
            <span>New Survey</span>
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
                      onClick={() => setPreviewingSurvey(s)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-amber-950 border border-amber-500 hover:bg-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs font-mono"
                      title="Preview Live Survey Form"
                    >
                      <Eye size={14} className="text-amber-950" />
                      <span>Preview</span>
                    </button>
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
                      onClick={() => copySurveyJson(s)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white border border-slate-900 hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs font-mono"
                      title="Copy Survey JSON to paste in Production"
                    >
                      {copiedId === s.sur_id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-amber-400" />}
                      <span>{copiedId === s.sur_id ? "Copied!" : "Copy JSON"}</span>
                    </button>
                    <button 
                      onClick={() => downloadSurveyJson(s)}
                      className="p-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 text-slate-700 cursor-pointer"
                      title="Download JSON File"
                    >
                      <Download size={14} />
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

        {/* Live Survey Form Preview Modal */}
        {previewingSurvey && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 border border-amber-500 text-amber-950 flex items-center justify-center shrink-0">
                    <Eye size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{previewingSurvey.sur_title}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200 text-amber-950">
                        Live Preview Mode
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      Survey ID: {previewingSurvey.sur_id} • Location: {previewingSurvey.location || 'All Locations'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewingSurvey(null)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
                {(() => {
                  let schemaQs = [];
                  if (previewingSurvey.sur_url) {
                    try {
                      schemaQs = JSON.parse(previewingSurvey.sur_url);
                    } catch (e) {}
                  }

                  if (!Array.isArray(schemaQs) || schemaQs.length === 0) {
                    return (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                        <FileText size={32} className="mx-auto text-slate-300" />
                        <p className="text-sm font-bold text-slate-700">No Custom Questions Configured</p>
                        <p className="text-xs text-slate-500">Edit this survey in Survey Builder to add module questions.</p>
                      </div>
                    );
                  }

                  return schemaQs.map((q, idx) => {
                    const opts = Array.isArray(q.options) ? q.options : [];
                    return (
                      <div key={q.id || idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 font-mono">{q.title || `Q${idx + 1}`}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase border border-slate-200">{q.type}</span>
                        </div>
                        {opts.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {opts.map((opt, oIdx) => {
                              const labelVal = typeof opt === 'object' && opt !== null ? opt.label : String(opt);
                              const codeVal = typeof opt === 'object' && opt !== null ? (opt.code ?? String(oIdx + 1)) : String(oIdx + 1);
                              return (
                                <div key={oIdx} className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                                  <span>{labelVal}</span>
                                  <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-200">Code {codeVal}</span>
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

              <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                <button 
                  onClick={() => setPreviewingSurvey(null)}
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md cursor-pointer"
                >
                  Close Preview
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Paste / Import Survey JSON Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                    <FileJson size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black font-mono uppercase tracking-tight text-white">
                      Paste &amp; Import Survey Schema JSON
                    </h2>
                    <p className="text-xs text-slate-300 font-medium">
                      Copy survey JSON from Localhost and paste it here to deploy instantly to Production.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowImportModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono block">
                    Survey Title (Optional override)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NCD - Full Screening Survey Master"
                    value={importSurveyTitle}
                    onChange={(e) => setImportSurveyTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono block">
                      Paste Survey JSON Code
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        accept=".json,.txt" 
                        ref={jsonFileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                      <button 
                        type="button"
                        onClick={() => jsonFileInputRef.current?.click()}
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <Upload size={12} /> Upload JSON File
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={12}
                    placeholder={`[\n  {\n    "id": "sec_1",\n    "title": "SECTION 1 · PARTICIPANT DEMOGRAPHICS",\n    "type": "section_header",\n    "section": 1\n  },\n  {\n    "id": "q1",\n    "title": "Q1. Age (years):",\n    "type": "number",\n    "required": true,\n    "section": 1\n  }\n]`}
                    value={pastedJson}
                    onChange={(e) => setPastedJson(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-300 bg-slate-900 text-amber-300 font-mono text-xs outline-none focus:ring-2 focus:ring-amber-400 shadow-inner leading-relaxed"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs font-medium space-y-1">
                  <div className="font-bold flex items-center gap-1.5 font-mono text-amber-900">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>How Localhost ➔ Production Copy/Paste Works:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900 font-sans pl-1">
                    <li>In <strong>Localhost</strong>, click <strong>"Copy JSON"</strong> on your completed survey.</li>
                    <li>Open <strong>Production (https://ncd.yrgmerf.in/)</strong>, click <strong>"Paste / Import Survey JSON"</strong>, and paste the JSON here.</li>
                    <li>Click <strong>"Import &amp; Deploy Survey"</strong> below. Your survey structure and skip rules will be live instantly!</li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportJsonSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-500 transition-all shadow-md cursor-pointer font-mono"
                >
                  <Check size={16} />
                  <span>Import &amp; Deploy Survey</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
