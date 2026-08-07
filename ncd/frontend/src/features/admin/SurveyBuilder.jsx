import React, { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Settings2, FileText, CheckSquare, AlignLeft, Hash, UploadCloud, Loader2, ChevronDown, ChevronUp, CircleDot, Table, FolderClosed, Save } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";

const Q_TYPES = [
  { id: "section_header", label: "Section Header", icon: FolderClosed },
  { id: "short_text", label: "Short Text", icon: AlignLeft },
  { id: "number", label: "Number", icon: Hash },
  { id: "dropdown", label: "Dropdown", icon: ChevronDown },
  { id: "single_choice", label: "Radio Button", icon: CircleDot },
  { id: "multi_choice", label: "Checkbox", icon: CheckSquare },
  { id: "matrix", label: "Matrix (Grid)", icon: Table },
];

export function SurveyBuilder({ notify, selectedSurvey, onBack }) {
  const [surveyTitle, setSurveyTitle] = useState(() => {
    return selectedSurvey ? selectedSurvey.sur_title : "New Survey Form";
  });
  const [questions, setQuestions] = useState(() => {
    if (selectedSurvey && selectedSurvey.sur_url) {
      try {
        const parsed = JSON.parse(selectedSurvey.sur_url);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse schema JSON:", e);
      }
    }
    return [];
  });
  const [expandedIds, setExpandedIds] = useState({});
  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef(null);

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all = {};
    questions.forEach(q => { all[q.id] = true; });
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const simulateImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const res = await fetch('/NCD.md');
      const text = await res.text();
      
      const lines = text.split('\n');
      const parsedQs = [];
      let currentQ = null;
      let qIndex = 0;
      
      for (let line of lines) {
          line = line.trim();
          if (!line) continue;
          
          if (line.startsWith("Section")) {
              parsedQs.push({
                  id: `sec_${parsedQs.length}`,
                  type: "section_header",
                  title: line,
                  required: false,
                  options: []
              });
              continue;
          }
          
          const qMatch = line.match(/^(Q\d+[a-z]?\.)(.*)/);
          if (qMatch) {
              if (currentQ) parsedQs.push(currentQ);
              
              const titleFull = qMatch[2].trim();
              let qType = "short_text";
              if (titleFull.toLowerCase().includes("select one") || titleFull.includes("◉")) {
                  qType = "single_choice";
              } else if (titleFull.toLowerCase().includes("tick all") || titleFull.toLowerCase().includes("multiple") || titleFull.includes("☐")) {
                  qType = "multi_choice";
              } else if (line.toLowerCase().includes("years") || titleFull.includes("₹")) {
                  qType = "number";
              }
              
              let titleClean = titleFull.replace("◉ select one", "").replace("tick all that apply", "").trim();
              currentQ = {
                  id: `q_${qIndex++}`,
                  type: qType,
                  title: qMatch[1] + " " + titleClean,
                  required: true,
                  options: [],
                  skipRule: { dependsOn: "", value: "", action: "show" }
              };
              continue;
          }
          
          if (line.startsWith("○")) {
              if (currentQ) {
                  let opt = line.replace("○", "").trim().replace(/^\d+\s+/, '');
                  currentQ.options.push(opt);
                  if (currentQ.type === "short_text") currentQ.type = "single_choice";
              }
              continue;
          }
          
          if (line.startsWith("☐")) {
              if (currentQ) {
                  let opt = line.replace("☐", "").trim().replace(/^\d+\s+/, '');
                  currentQ.options.push(opt);
                  currentQ.type = "multi_choice";
              }
              continue;
          }
      }
      if (currentQ) parsedQs.push(currentQ);
      
      setTimeout(() => {
        setQuestions(parsedQs);
        setImporting(false);
        notify("success", "Survey Imported", `Successfully extracted ${parsedQs.length} items from ${file.name}`);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }, 1500);

    } catch (e) {
      console.error(e);
      setImporting(false);
      notify("error", "Import Failed", "Could not parse the document.");
    }
  };

  const addQuestion = (typeId) => {
    const newId = `q_${Date.now()}`;
    const newQ = {
      id: newId,
      type: typeId,
      title: "",
      required: false,
      options: typeId === "dropdown" || typeId === "single_choice" || typeId === "multi_choice" ? ["Option 1", "Option 2"] : [],
      skipRule: { dependsOn: "", value: "", action: "show" },
      rows: typeId === "matrix" ? ["Row 1", "Row 2"] : [],
      columns: typeId === "matrix" ? ["Col 1", "Col 2"] : [],
    };
    setQuestions([...questions, newQ]);
    setExpandedIds(prev => ({ ...prev, [newId]: true }));
  };

  const updateQ = (id, key, val) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [key]: val } : q));
  };

  const moveQ = (idx, dir) => {
    const newQs = [...questions];
    if (dir === "up" && idx > 0) {
      [newQs[idx - 1], newQs[idx]] = [newQs[idx], newQs[idx - 1]];
    } else if (dir === "down" && idx < newQs.length - 1) {
      [newQs[idx + 1], newQs[idx]] = [newQs[idx], newQs[idx + 1]];
    }
    setQuestions(newQs);
  };

  const deleteQ = (id) => setQuestions(questions.filter(q => q.id !== id));

  const addOption = (qId) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const currentOptions = Array.isArray(q.options) ? q.options : [];
        return { ...q, options: [...currentOptions, `Option ${currentOptions.length + 1}`] };
      }
      return q;
    }));
  };

  const updateOption = (qId, optIdx, val) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const currentOptions = Array.isArray(q.options) ? q.options : [];
        const newOpts = [...currentOptions];
        newOpts[optIdx] = val;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const removeOption = (qId, optIdx) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const currentOptions = Array.isArray(q.options) ? q.options : [];
        const newOpts = [...currentOptions];
        newOpts.splice(optIdx, 1);
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    if (!surveyTitle.trim()) {
      notify("error", "Validation Error", "Survey title cannot be empty.");
      return;
    }
    if (questions.some(q => !q.title.trim())) {
      notify("error", "Validation Error", "All questions must have a title.");
      return;
    }
    try {
      if (selectedSurvey) {
        await api.put(`/api/v1/surveymaster/update/${selectedSurvey.sur_id}`, {
          sur_title: surveyTitle,
          sur_url: JSON.stringify(questions)
        });
        notify("success", "Survey Saved", "The survey schema has been updated successfully.");
      } else {
        notify("info", "New Survey", "Creating new survey record...");
        await api.post("/api/v1/surveymaster/create", {
          sur_title: surveyTitle,
          sur_code: `S-${Date.now().toString().slice(-4)}`,
          sur_url: JSON.stringify(questions)
        });
        notify("success", "Survey Created", "New survey created successfully.");
      }
      if (onBack) onBack();
    } catch (e) {
      console.error(e);
      notify("error", "Save Failed", "Could not save the survey schema to the database.");
    }
  };

  return (
    <div className="flex h-full bg-[#F7F6F2]">
      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-8 pb-32">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                placeholder="Enter Survey Title..."
                className="text-2xl font-bold bg-transparent outline-none border-b border-dashed border-slate-300 hover:border-slate-400 focus:border-slate-900 w-full pb-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.ink }}
              />
              <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: T.charcoal500, marginTop: 4 }}>Create sections, build skip logic rules, and define question grids.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={expandAll}
                className="px-4 py-2 rounded-full text-xs font-bold bg-white border hover:bg-slate-50 transition-colors"
                style={{ borderColor: T.line, color: T.charcoal700 }}
              >
                Expand All
              </button>
              <button 
                onClick={collapseAll}
                className="px-4 py-2 rounded-full text-xs font-bold bg-white border hover:bg-slate-50 transition-colors"
                style={{ borderColor: T.line, color: T.charcoal700 }}
              >
                Collapse All
              </button>
              {onBack && (
                <button 
                  onClick={onBack}
                  className="px-5 py-2.5 rounded-full text-sm font-medium shadow-sm transition-transform bg-white border hover:bg-slate-50"
                  style={{ borderColor: T.line, color: T.charcoal700, fontFamily: "'IBM Plex Sans', sans-serif" }}
                >
                  Back
                </button>
              )}
              <input 
                type="file" 
                accept=".docx,.pdf,.md,.txt" 
                ref={fileInputRef} 
                onChange={simulateImport} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium shadow-sm transition-transform bg-white border disabled:opacity-50"
                style={{ borderColor: T.line, color: T.ink, fontFamily: "'IBM Plex Sans', sans-serif" }}
              >
                {importing ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                Import
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-transform bg-slate-900 text-white"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
              >
                <Save size={16} /> Save Schema
              </button>
            </div>
          </div>

          {questions.map((q, idx) => {
            const isExpanded = !!expandedIds[q.id];
            return (
              <div 
                key={q.id} 
                className="rounded-2xl p-5 relative group shadow-sm transition-all bg-white border hover:shadow-md"
                style={{ borderColor: T.line }}
              >
                {/* Header view (always visible) */}
                <div className="flex items-center justify-between gap-4 cursor-pointer" onClick={() => toggleExpand(q.id)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5 items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mr-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => moveQ(idx, "up")} disabled={idx===0} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"><ArrowUp size={12} color={T.charcoal700}/></button>
                      <button onClick={() => moveQ(idx, "down")} disabled={idx===questions.length-1} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"><ArrowDown size={12} color={T.charcoal700}/></button>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0" style={{ background: T.blueTint, color: T.blueDeep, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {Q_TYPES.find(t => t.id === q.type)?.label || q.type}
                    </span>

                    <h3 className="text-sm font-bold text-slate-800 truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {q.title || <span className="text-slate-400 italic">Untitled Question</span>}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 shrink-0" onClick={e => e.stopPropagation()}>
                    {q.type !== "section_header" && (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={q.required} onChange={(e) => updateQ(q.id, "required", e.target.checked)} className="accent-[#121110] h-3.5 w-3.5" />
                        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: T.charcoal700, fontWeight: 600 }}>Required</span>
                      </label>
                    )}
                    <button onClick={() => deleteQ(q.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <button onClick={() => toggleExpand(q.id)} className="p-1 rounded hover:bg-slate-100">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Detailed Editor (expanded) */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100 space-y-5 animate-in fade-in duration-200">
                    <input 
                      type="text" 
                      placeholder={q.type === "section_header" ? "Enter Section Title..." : "Enter your question..."} 
                      value={q.title}
                      onChange={(e) => updateQ(q.id, "title", e.target.value)}
                      className="w-full text-base outline-none bg-transparent font-medium"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.ink, borderBottom: `1px solid ${T.line}`, paddingBottom: 4 }}
                    />

                    {/* Columns layout for Skip logic and Options */}
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Left: Input options / config */}
                      <div className="space-y-4">
                        {/* Matrix config */}
                        {q.type === "matrix" && (
                          <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Rows (Questions)</p>
                              <div className="space-y-2">
                                {(q.rows || []).map((row, rIdx) => (
                                  <div key={rIdx} className="flex items-center gap-2">
                                    <input 
                                      type="text" 
                                      value={row} 
                                      onChange={(e) => {
                                        const newRows = [...(q.rows || [])];
                                        newRows[rIdx] = e.target.value;
                                        updateQ(q.id, "rows", newRows);
                                      }}
                                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                                    />
                                    <button onClick={() => {
                                      const newRows = [...(q.rows || [])];
                                      newRows.splice(rIdx, 1);
                                      updateQ(q.id, "rows", newRows);
                                    }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                                  </div>
                                ))}
                                <button onClick={() => updateQ(q.id, "rows", [...(q.rows || []), `Row ${ (q.rows || []).length + 1 }`])} className="text-xs text-sky-600 font-bold flex items-center gap-1 mt-1">
                                  <Plus size={12}/> Add Row
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Columns (Options)</p>
                              <div className="space-y-2">
                                {(q.columns || []).map((col, cIdx) => (
                                  <div key={cIdx} className="flex items-center gap-2">
                                    <input 
                                      type="text" 
                                      value={col} 
                                      onChange={(e) => {
                                        const newCols = [...(q.columns || [])];
                                        newCols[cIdx] = e.target.value;
                                        updateQ(q.id, "columns", newCols);
                                      }}
                                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                                    />
                                    <button onClick={() => {
                                      const newCols = [...(q.columns || [])];
                                      newCols.splice(cIdx, 1);
                                      updateQ(q.id, "columns", newCols);
                                    }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                                  </div>
                                ))}
                                <button onClick={() => updateQ(q.id, "columns", [...(q.columns || []), `Column ${ (q.columns || []).length + 1 }`])} className="text-xs text-sky-600 font-bold flex items-center gap-1 mt-1">
                                  <Plus size={12}/> Add Column
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Standard choice options (Dropdown, Radio, Checkbox) */}
                        {(q.type === "single_choice" || q.type === "multi_choice" || q.type === "dropdown") && (
                          <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Choices / Options</p>
                            {(q.options || []).map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                {q.type === "single_choice" ? <div className="w-3 h-3 rounded-full border border-gray-400 shrink-0" /> : <div className="w-3 h-3 rounded border border-gray-400 shrink-0" />}
                                <input 
                                  type="text" 
                                  value={opt}
                                  onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                                  className="flex-1 outline-none text-xs bg-white px-2 py-1 rounded border border-slate-200"
                                  style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal900 }}
                                />
                                <button onClick={() => removeOption(q.id, oIdx)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                              </div>
                            ))}
                            <button 
                              onClick={() => addOption(q.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-85 transition-opacity mt-2 text-sky-600"
                              style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                            >
                              <Plus size={13} /> Add Option
                            </button>
                          </div>
                        )}

                        {/* Standard inputs display */}
                        {(q.type === "short_text" || q.type === "number") && (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/50 text-xs text-slate-500 italic">
                            Standard field inputs require no options config.
                          </div>
                        )}
                      </div>

                      {/* Right: Skip Logic rules */}
                      <div>
                        {q.type !== "section_header" && (
                          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3 text-xs">
                            <p className="font-bold text-slate-700 flex items-center gap-1.5"><Settings2 size={13}/> Skip Logic & Visibility Rules</p>
                            
                            <div className="space-y-2.5">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">If Question</label>
                                <select 
                                  value={q.skipRule?.dependsOn || ""} 
                                  onChange={(e) => updateQ(q.id, "skipRule", { ...q.skipRule, dependsOn: e.target.value })}
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
                                >
                                  <option value="">Select question...</option>
                                  {questions.filter(other => other.id !== q.id && other.type !== "section_header").map(other => (
                                    <option key={other.id} value={other.id}>{other.title || other.id}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Is Equal To</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. Yes" 
                                    value={q.skipRule?.value || ""} 
                                    onChange={(e) => updateQ(q.id, "skipRule", { ...q.skipRule, value: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Action</label>
                                  <select 
                                    value={q.skipRule?.action || "show"} 
                                    onChange={(e) => updateQ(q.id, "skipRule", { ...q.skipRule, action: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
                                  >
                                    <option value="show">Show question</option>
                                    <option value="hide">Hide question</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {questions.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed rounded-3xl" style={{ borderColor: T.line }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, color: T.charcoal700 }}>No questions added yet. Click items in the toolbar below to start building.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Toolbar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 ml-32 z-50">
        <div className="flex items-center gap-2 px-5 py-3.5 rounded-full shadow-lg backdrop-blur-xl bg-white/95 border border-slate-200">
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, fontWeight: 750, color: T.charcoal500, marginRight: 8 }}>ADD ITEM:</span>
          <div className="flex gap-1.5 flex-wrap">
            {Q_TYPES.map(t => {
              const Icon = t.icon;
              return (
                <button 
                  key={t.id}
                  onClick={() => addQuestion(t.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  title={t.label}
                >
                  <Icon size={13} color={T.ink} />
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: T.ink, fontWeight: 600 }}>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
