import React, { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Settings2, FileText, CheckSquare, AlignLeft, Hash, UploadCloud, Loader2, ChevronDown, ChevronUp, CircleDot, Table, FolderClosed, Save, ChevronLeft, ArrowUpDown, Filter, SlidersHorizontal, Layers, X, MoveUp, MoveDown } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";

export const SECTION_CATALOG = [
  { id: 1, label: "Sec 1 · Demographics" },
  { id: 2, label: "Sec 2 · Medical History" },
  { id: 3, label: "Sec 3 · Tobacco Use" },
  { id: 4, label: "Sec 4 · Alcohol Use" },
  { id: 5, label: "Sec 5 · Other Substance Use" },
  { id: 6, label: "Sec 6 · Diet & Activity" },
  { id: 7, label: "Sec 7 · Symptoms" },
  { id: 8, label: "Sec 8 · Mental Health" },
  { id: 9, label: "Sec 9 · Anthropometry" },
  { id: 10, label: "Sec 10 · Vitals" },
  { id: 11, label: "Sec 11 · POC Tests" },
  { id: 12, label: "Sec 12 · Clinical Exams" },
  { id: 13, label: "Sec 13 · Risk & Referral" },
  { id: 14, label: "Sec 14 · Linkages" },
  { id: 15, label: "Sec 15 · Health Counseling" },
  { id: 16, label: "Sec 16 · Community Perception" }
];

const Q_TYPES = [
  { id: "section_header", label: "Section Header", icon: FolderClosed },
  { id: "short_text", label: "Short Text", icon: AlignLeft },
  { id: "number", label: "Number", icon: Hash },
  { id: "dropdown", label: "Dropdown", icon: ChevronDown },
  { id: "single_choice", label: "Radio", icon: CircleDot },
  { id: "multi_choice", label: "Checkbox", icon: CheckSquare },
  { id: "matrix", label: "Matrix", icon: Table },
];

export function SurveyBuilder({ notify, selectedSurvey, onBack }) {
  const [surveyTitle, setSurveyTitle] = useState(() => {
    return selectedSurvey ? selectedSurvey.sur_title : "New Survey Form";
  });
  const [questions, setQuestions] = useState(() => {
    if (selectedSurvey) {
      if (selectedSurvey.sur_url) {
        try {
          const parsed = JSON.parse(selectedSurvey.sur_url);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error("Failed to parse schema JSON:", e);
        }
      }
      try {
        const activeStr = localStorage.getItem('ncd_active_survey_questions');
        if (activeStr) {
          const parsed = JSON.parse(activeStr);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [expandedIds, setExpandedIds] = useState({});
  const [importing, setImporting] = useState(false);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const fileInputRef = React.useRef(null);

  const moveSectionBlock = (targetSec, direction) => {
    const secNumbers = Array.from(new Set(questions.map((q) => {
      const match = String(q.title || "").match(/Section\s*(\d+)/i);
      return match ? parseInt(match[1]) : (q.section ? parseInt(q.section) : 1);
    }))).sort((a, b) => a - b);

    const currIdx = secNumbers.indexOf(targetSec);
    if (currIdx === -1) return;
    const swapIdx = direction === 'up' ? currIdx - 1 : currIdx + 1;
    if (swapIdx < 0 || swapIdx >= secNumbers.length) return;

    const grouped = {};
    secNumbers.forEach(s => { grouped[s] = []; });
    
    let currentSec = 1;
    questions.forEach(q => {
      const match = String(q.title || "").match(/Section\s*(\d+)/i);
      if (match) currentSec = parseInt(match[1]);
      else if (q.section) currentSec = parseInt(q.section);
      if (!grouped[currentSec]) grouped[currentSec] = [];
      grouped[currentSec].push(q);
    });

    const reorderedSecs = [...secNumbers];
    [reorderedSecs[currIdx], reorderedSecs[swapIdx]] = [reorderedSecs[swapIdx], reorderedSecs[currIdx]];

    let newQuestions = [];
    reorderedSecs.forEach(s => {
      if (grouped[s]) newQuestions.push(...grouped[s]);
    });

    setQuestions(newQuestions);
    notify("success", "Section Reordered", `Moved Section ${targetSec} ${direction}.`);
  };

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
      title: typeId === "section_header" ? "Section Header Title" : "New Question Title",
      required: false,
      options: typeId === "single_choice" || typeId === "multi_choice" || typeId === "dropdown" ? ["Option 1", "Option 2"] : [],
      skipRule: { dependsOn: "", value: "", action: "show" }
    };
    setQuestions(prev => [...prev, newQ]);
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
        const nextCode = String(currentOptions.length + 1);
        return { ...q, options: [...currentOptions, { label: `Option ${nextCode}`, code: nextCode }] };
      }
      return q;
    }));
  };

  const updateOptionLabel = (qId, optIdx, val) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const currentOptions = Array.isArray(q.options) ? q.options : [];
        const newOpts = [...currentOptions];
        const existing = newOpts[optIdx];
        if (typeof existing === 'object' && existing !== null) {
          newOpts[optIdx] = { ...existing, label: val };
        } else {
          newOpts[optIdx] = { label: val, code: String(optIdx + 1) };
        }
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const updateOptionCode = (qId, optIdx, val) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const currentOptions = Array.isArray(q.options) ? q.options : [];
        const newOpts = [...currentOptions];
        const existing = newOpts[optIdx];
        if (typeof existing === 'object' && existing !== null) {
          newOpts[optIdx] = { ...existing, code: val };
        } else {
          newOpts[optIdx] = { label: String(existing || ''), code: val };
        }
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const updateOption = updateOptionLabel;

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
    if (!questions || questions.length === 0) {
      notify("error", "Validation Error", "Cannot save an empty survey. Please add at least one question or section.");
      return;
    }
    if (questions.some(q => !q.title.trim())) {
      notify("error", "Validation Error", "All questions must have a title.");
      return;
    }
    try {
      const jsonQs = JSON.stringify(questions);
      localStorage.setItem('ncd_active_survey_questions', jsonQs);
      
      if (selectedSurvey) {
        if (selectedSurvey.sur_id) {
          localStorage.setItem(`ncd_survey_${selectedSurvey.sur_id}`, jsonQs);
        }
        await api.put(`/api/v1/surveymaster/update/${selectedSurvey.sur_id}`, {
          sur_title: surveyTitle,
          sur_url: jsonQs
        });
        notify("success", "Survey Saved", "The survey schema has been updated successfully.");
      } else {
        notify("info", "New Survey", "Creating new survey record...");
        await api.post("/api/v1/surveymaster/create", {
          sur_title: surveyTitle,
          sur_code: `S-${Date.now().toString().slice(-4)}`,
          sur_url: jsonQs
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F7F6F2]">
      
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 sm:py-4 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {onBack && (
              <button 
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-200 transition-all cursor-pointer shrink-0"
                title="Back to Surveys"
              >
                <ChevronLeft size={16} /> <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                placeholder="Enter Survey Title..."
                className="text-lg sm:text-2xl font-black bg-transparent outline-none border-b border-dashed border-slate-300 hover:border-slate-400 focus:border-slate-900 w-full pb-0.5 leading-tight break-words uppercase font-mono tracking-tight text-slate-900"
              />
              <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: T.charcoal500, marginTop: 2 }}>
                Create sections, build skip logic rules, and define question grids.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
            <button 
              onClick={expandAll}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer text-slate-700"
            >
              Expand All
            </button>
            <button 
              onClick={collapseAll}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer text-slate-700"
            >
              Collapse All
            </button>
            
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold shadow-2xs transition-transform bg-white border border-slate-200 disabled:opacity-50 text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              {importing ? <Loader2 size={15} className="animate-spin text-amber-600" /> : <UploadCloud size={15} className="text-slate-600" />}
              <span>Import</span>
            </button>

            <button 
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-black shadow-md transition-all bg-slate-900 text-white hover:bg-black cursor-pointer"
            >
              <Save size={15} className="text-amber-400" /> <span>Save Schema</span>
            </button>
          </div>

        </div>
      </header>

      {/* Section Quick Jump & Reorder Sorting Bar Component (Clean Professional Layout) */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-2xs z-30 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Section Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth flex-1 min-w-0">
            <span className="text-xs font-black uppercase font-mono tracking-wider bg-amber-100 text-amber-950 border border-amber-300 px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 shadow-2xs">
              <Filter size={13} className="text-amber-700" /> Sections
            </span>

            {(() => {
              // Helper to sequentially calculate section number for every question
              let runSec = 1;
              const questionsWithSec = (questions || []).map(q => {
                const match = String(q.title || "").match(/Section\s*(\d+)/i);
                if (match) runSec = parseInt(match[1]);
                else if (q.section) runSec = parseInt(q.section);
                return { ...q, _secNum: runSec };
              });

              return (
                <>
                  <button
                    onClick={() => setSelectedSectionFilter('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                      selectedSectionFilter === 'all' 
                        ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-sm' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    All Sections ({questions.length})
                  </button>

                  {SECTION_CATALOG.map((sec) => {
                    const secQuestions = questionsWithSec.filter(q => q._secNum === sec.id && q.type !== 'section_header');
                    const count = secQuestions.length;
                    const isSelected = selectedSectionFilter === sec.id;

                    return (
                      <button
                        key={sec.id}
                        onClick={() => setSelectedSectionFilter(sec.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-2 border ${
                          isSelected 
                            ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-sm' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span>{sec.label}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-lg font-mono font-black ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </>
              );
            })()}
          </div>

          {/* Section Reorder Modal Trigger Button */}
          <button
            onClick={() => setShowSortModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#f5d40b] text-[#4a4a4c] hover:bg-[#e0c20a] border border-[#e5c40a] transition-all shadow-2xs cursor-pointer shrink-0"
            title="Sort / Reorder Survey Sections"
          >
            <ArrowUpDown size={14} />
            <span className="hidden sm:inline">Sort / Reorder Sections</span>
            <span className="sm:hidden">Sort</span>
          </button>
        </div>
      </div>

      {/* Section Sorting & Reordering Modal Component */}
      {showSortModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={20} className="text-amber-600" />
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Sort & Reorder Survey Sections
                </h3>
              </div>
              <button 
                onClick={() => setShowSortModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Use the Move Up and Move Down buttons to reorder entire section question blocks instantly.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {SECTION_CATALOG.map((sec, idx) => {
                let runSec = 1;
                const secQs = (questions || []).filter(q => {
                  const match = String(q.title || "").match(/Section\s*(\d+)/i);
                  if (match) runSec = parseInt(match[1]);
                  else if (q.section) runSec = parseInt(q.section);
                  return runSec === sec.id && q.type !== 'section_header';
                });

                return (
                  <div 
                    key={sec.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                        {sec.id}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{sec.label}</h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {secQs.length} Questions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => moveSectionBlock(sec.id, 'up')}
                        disabled={idx === 0}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                        title="Move Section Up"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        onClick={() => moveSectionBlock(sec.id, 'down')}
                        disabled={idx === SECTION_CATALOG.length - 1}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                        title="Move Section Down"
                      >
                        <ArrowDown size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSortModal(false)}
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Scrollable Questions Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-36">
        <div className="max-w-6xl mx-auto space-y-6">

          {(() => {
            let runSec = 1;
            const qsWithSec = (questions || []).map(q => {
              const match = String(q.title || "").match(/Section\s*(\d+)/i);
              if (match) runSec = parseInt(match[1]);
              else if (q.section) runSec = parseInt(q.section);
              return { ...q, _secNum: runSec };
            });

            const filteredQs = qsWithSec.filter(q => {
              if (selectedSectionFilter === 'all') return true;
              return q._secNum === selectedSectionFilter;
            });

            return (
              <>
                {selectedSectionFilter !== 'all' && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold font-mono shadow-2xs">
                    <span>Viewing {SECTION_CATALOG.find(s => s.id === selectedSectionFilter)?.label} ({filteredQs.length} items)</span>
                    <button 
                      onClick={() => setSelectedSectionFilter('all')}
                      className="px-3.5 py-1 rounded-full bg-slate-900 text-white font-extrabold hover:bg-black transition-colors cursor-pointer"
                    >
                      Show All Sections
                    </button>
                  </div>
                )}

                {filteredQs.map((q, idx) => {
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
                          <div className="space-y-2.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Choices / Options & Option Codes</p>
                              <span className="text-[10px] text-amber-700 font-mono font-bold">Codebook ID (1, 2, 11, 16...)</span>
                            </div>
                            {(q.options || []).map((opt, oIdx) => {
                              const labelVal = typeof opt === 'object' && opt !== null ? opt.label : String(opt);
                              const codeVal = typeof opt === 'object' && opt !== null ? (opt.code ?? String(oIdx + 1)) : String(oIdx + 1);

                              return (
                                <div key={oIdx} className="flex items-center gap-2">
                                  {q.type === "single_choice" ? <div className="w-3 h-3 rounded-full border border-gray-400 shrink-0" /> : <div className="w-3 h-3 rounded border border-gray-400 shrink-0" />}
                                  <input 
                                    type="text" 
                                    placeholder="Option text..." 
                                    value={labelVal}
                                    onChange={(e) => updateOptionLabel(q.id, oIdx, e.target.value)}
                                    className="flex-1 outline-none text-xs bg-white px-2.5 py-1.5 rounded-xl border border-slate-200"
                                    style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal900 }}
                                  />
                                  <div className="flex items-center gap-1 bg-amber-50/90 px-2 py-1 rounded-xl border border-amber-200 shrink-0">
                                    <span className="text-[10px] font-bold text-amber-900 font-mono">Code:</span>
                                    <input 
                                      type="text" 
                                      placeholder={String(oIdx + 1)} 
                                      value={codeVal}
                                      onChange={(e) => updateOptionCode(q.id, oIdx, e.target.value)}
                                      className="w-12 text-xs font-mono font-bold text-amber-950 bg-white px-1 py-0.5 rounded border border-amber-300 outline-none text-center"
                                    />
                                  </div>
                                  <button onClick={() => removeOption(q.id, oIdx)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                                </div>
                              );
                            })}
                            <button 
                              onClick={() => addOption(q.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-85 transition-opacity mt-2 text-sky-600 cursor-pointer"
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
            </>
          );
        })()}

          {questions.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed rounded-3xl" style={{ borderColor: T.line }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, color: T.charcoal700 }}>No questions added yet. Click items in the toolbar below to start building.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Toolbar (Clean Professional Action Dock) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[96vw]">
        <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1 pr-2 border-r border-slate-800 shrink-0">
            <Plus size={13} className="text-amber-400" /> Add:
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {Q_TYPES.filter(t => t.id !== 'section_header').map(t => {
              const Icon = t.icon;
              return (
                <button 
                  key={t.id}
                  onClick={() => addQuestion(t.id)}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-amber-400 hover:text-slate-950 transition-all border border-slate-700/80 text-slate-200 text-xs font-bold shrink-0 cursor-pointer shadow-2xs group"
                  title={`Add ${t.label} Question`}
                >
                  <Icon size={12} className="shrink-0 text-slate-400 group-hover:text-slate-950" />
                  <span className="text-xs whitespace-nowrap">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
