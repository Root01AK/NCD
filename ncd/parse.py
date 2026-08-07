import re
import json

def parse_survey(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    questions = []
    current_q = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Section header
        if line.startswith("Section"):
            questions.append({
                "id": f"sec_{len(questions)}",
                "type": "section_header",
                "title": line,
                "required": False,
                "options": []
            })
            continue
            
        # Question
        q_match = re.match(r'^(Q\d+[a-z]?\.)(.*)', line)
        if q_match:
            if current_q:
                questions.append(current_q)
                
            title_full = q_match.group(2).strip()
            # Determine type
            q_type = "short_text"
            if "select one" in title_full.lower() or "◉" in title_full:
                q_type = "single_choice"
            elif "tick all" in title_full.lower() or "multiple" in title_full.lower() or "☐" in title_full:
                q_type = "multi_choice"
            elif "years" in line.lower() or "₹" in title_full:
                q_type = "number"
                
            # clean title
            title_clean = title_full.replace("◉ select one", "").replace("tick all that apply", "").strip()
            
            current_q = {
                "id": f"q_{len(questions)}",
                "type": q_type,
                "title": q_match.group(1) + " " + title_clean,
                "required": True,
                "options": []
            }
            continue
            
        # Option single choice
        if line.startswith("○"):
            if current_q:
                opt = line.replace("○", "").strip()
                # remove leading number like '1 Male' -> 'Male'
                opt = re.sub(r'^\d+\s+', '', opt)
                current_q["options"].append(opt)
                if current_q["type"] == "short_text":
                    current_q["type"] = "single_choice"
            continue
            
        # Option multi choice
        if line.startswith("☐"):
            if current_q:
                opt = line.replace("☐", "").strip()
                opt = re.sub(r'^\d+\s+', '', opt)
                current_q["options"].append(opt)
                current_q["type"] = "multi_choice"
            continue
            
    if current_q:
        questions.append(current_q)
        
    return questions

qs = parse_survey('/Users/kirubakaran/Desktop/NCD/NCD.md')

with open('/Users/kirubakaran/Desktop/NCD/ncd/frontend/src/lib/ncdSurveyData.js', 'w') as f:
    f.write("export const ncdSurveyData = " + json.dumps(qs, indent=2) + ";\n")

print(f"Parsed {len(qs)} elements.")
