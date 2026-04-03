import re
from hashlib import sha256


def code_hash(code: str) -> str:
    return sha256(code.encode("utf-8")).hexdigest()


def non_empty_lines(code: str) -> list[str]:
    return [line for line in code.splitlines() if line.strip()]


def detect_language(code: str, requested_language: str | None = None) -> str:
    if requested_language:
        normalized = requested_language.strip().lower()
        return {
            "py": "Python",
            "python": "Python",
            "js": "JavaScript",
            "javascript": "JavaScript",
            "cpp": "C++",
            "c++": "C++",
            "java": "Java",
        }.get(normalized, requested_language)
    lowered = code.lower()
    if "def " in lowered or "print(" in lowered:
        return "Python"
    if "console.log" in lowered or "function " in lowered or "const " in lowered:
        return "JavaScript"
    if "#include" in lowered or "std::" in lowered:
        return "C++"
    if "public class" in lowered or "system.out.println" in lowered:
        return "Java"
    return "Code"


def summarize_code(code: str, language: str) -> str:
    lowered = code.lower()
    if "binary_search" in lowered or "binary search" in lowered:
        return "This program implements binary search to locate a target value efficiently in a sorted collection."
    if "sort" in lowered and ("while" in lowered or "for" in lowered):
        return "This program sorts data by repeatedly comparing and rearranging values."
    if "dfs" in lowered or "bfs" in lowered or "graph" in lowered:
        return "This program traverses a graph structure and explores connected nodes."
    if "class " in lowered:
        return f"This {language} program defines class-based logic and supporting methods."
    return f"This {language} program processes input code, applies control flow, and produces a result."


def generate_live_comments(code: str) -> list[dict]:
    comments: list[dict] = []
    for idx, line in enumerate(code.splitlines(), start=1):
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith(("def ", "function ", "class ")):
            comments.append({"line": idx, "comment": "Defines a new logical unit or reusable behavior.", "type": "important"})
        elif stripped.startswith(("for ", "while ", "for(")):
            comments.append({"line": idx, "comment": "Loop iterates across a sequence or repeated condition.", "type": "info"})
        elif stripped.startswith(("if ", "elif ", "else", "if(")):
            comments.append({"line": idx, "comment": "Conditional branch changes program flow based on a condition.", "type": "info"})
        elif "return" in stripped:
            comments.append({"line": idx, "comment": "Returns a value to the caller and ends the current branch.", "type": "important"})
        elif "/0" in stripped or "/ 0" in stripped:
            comments.append({"line": idx, "comment": "This line can raise a division-by-zero error.", "type": "warning"})
        elif "input(" in stripped or "stdin" in stripped.lower():
            comments.append({"line": idx, "comment": "Reads external input, so validation may be important.", "type": "warning"})
    return comments[:20]


def split_sections(code: str) -> list[dict]:
    lines = code.splitlines()
    if not lines:
        return []

    sections: list[dict] = []
    current_start = 1
    current_label = "Setup"
    for idx, line in enumerate(lines, start=1):
        stripped = line.strip()
        if stripped.startswith(("for ", "while ", "for(")):
            if idx > current_start:
                sections.append(_section(current_label, current_start, idx - 1))
            current_start = idx
            current_label = "Loop"
        elif stripped.startswith(("if ", "elif ", "else", "if(")):
            if idx > current_start:
                sections.append(_section(current_label, current_start, idx - 1))
            current_start = idx
            current_label = "Condition Handling"
        elif "return" in stripped:
            if idx > current_start:
                sections.append(_section(current_label, current_start, idx - 1))
            current_start = idx
            current_label = "Return Value"
    sections.append(_section(current_label, current_start, len(lines)))
    deduped: list[dict] = []
    seen: set[tuple[int, int]] = set()
    for section in sections:
        key = (section["start_line"], section["end_line"])
        if key not in seen:
            seen.add(key)
            deduped.append(section)
    return deduped[:6]


def _section(title: str, start_line: int, end_line: int) -> dict:
    return {
        "title": title,
        "start_line": start_line,
        "end_line": end_line,
        "summary": {
            "Setup": "Prepares variables, inputs, or initial state.",
            "Loop": "Iterates through data or repeats until a condition changes.",
            "Condition Handling": "Branches the logic depending on runtime conditions.",
            "Return Value": "Produces the final result from the current function or flow.",
        }.get(title, "Groups related statements together."),
    }


def explain_line(code: str, line_number: int) -> dict:
    lines = code.splitlines()
    if line_number < 1 or line_number > len(lines):
        return {"line_number": line_number, "explanation": "This line number is outside the current code sample.", "related_lines": []}
    line = lines[line_number - 1].strip()
    if line.startswith(("def ", "function ", "class ")):
        explanation = "This line declares a reusable unit of logic and defines its entry point."
    elif line.startswith(("for ", "while ", "for(")):
        explanation = "This line starts a loop that repeatedly executes the following block."
    elif line.startswith(("if ", "elif ", "else", "if(")):
        explanation = "This line checks a condition and decides which branch should run."
    elif "return" in line:
        explanation = "This line sends a result back to the caller."
    elif "=" in line:
        explanation = "This line assigns or updates a value used later in the program."
    else:
        explanation = "This line contributes to the current algorithm or data processing step."
    related = [n for n in (line_number - 1, line_number + 1) if 1 <= n <= len(lines)]
    return {"line_number": line_number, "explanation": explanation, "related_lines": related}


def detect_bugs(code: str) -> list[dict]:
    bugs: list[dict] = []
    for idx, line in enumerate(code.splitlines(), start=1):
        stripped = line.strip()
        if "/0" in stripped or "/ 0" in stripped:
            bugs.append(
                {
                    "title": "Division by zero possible",
                    "line": idx,
                    "severity": "high",
                    "category": "runtime",
                    "description": "The divisor is literally zero on this line, which will fail at runtime.",
                    "fix_suggestion": "Validate the divisor or guard the division before execution.",
                }
            )
        if "while(true)" in stripped.lower().replace(" ", ""):
            bugs.append(
                {
                    "title": "Potential infinite loop",
                    "line": idx,
                    "severity": "medium",
                    "category": "logic",
                    "description": "This loop appears to run forever unless there is a guaranteed break path.",
                    "fix_suggestion": "Add a clear exit condition or a bounded iteration limit.",
                }
            )
        if re.search(r"range\s*\(\s*len\(.+\)\s*\+\s*1\s*\)", stripped):
            bugs.append(
                {
                    "title": "Possible off-by-one access",
                    "line": idx,
                    "severity": "medium",
                    "category": "logic",
                    "description": "Iterating to len(x) + 1 often overshoots valid indexes.",
                    "fix_suggestion": "Iterate to len(x) or use direct iteration instead of manual indexing.",
                }
            )
    return bugs


def detect_assumptions(code: str) -> list[dict]:
    assumptions: list[dict] = []
    lowered = code.lower()
    if "binary_search" in lowered or "mid =" in lowered:
        assumptions.append(
            {
                "title": "Input collection is sorted",
                "category": "data",
                "description": "Binary-search-style logic only works correctly when the input data is ordered.",
            }
        )
    if "arr[" in lowered or "list[" in lowered or "array[" in lowered:
        assumptions.append(
            {
                "title": "Indexes stay in range",
                "category": "index",
                "description": "The code assumes computed indexes never fall outside the collection bounds.",
            }
        )
    if "input(" in lowered or "stdin" in lowered:
        assumptions.append(
            {
                "title": "Input format is valid",
                "category": "input",
                "description": "The code assumes user-provided input already matches the expected format and type.",
            }
        )
    return assumptions or [
        {
            "title": "Inputs match expected types",
            "category": "input",
            "description": "The code assumes callers pass values of the correct type and shape.",
        }
    ]


def on_track_status(code: str, language: str) -> dict:
    lines = non_empty_lines(code)
    bugs = detect_bugs(code)
    warning_count = len([comment for comment in generate_live_comments(code) if comment["type"] == "warning"])
    error_count = len([bug for bug in bugs if bug["severity"] == "high"])
    if not lines:
        return {
            "type": "idle",
            "message": "Ready to code",
            "details": "Write or paste code to get instant AI feedback",
            "language": language,
            "line_count": 0,
            "warning_count": 0,
            "error_count": 0,
        }
    if error_count:
        return {
            "type": "error",
            "message": "Error - high-risk issue detected in the current code",
            "details": f"{language} - {len(lines)} lines - {error_count} error",
            "language": language,
            "line_count": len(lines),
            "warning_count": warning_count,
            "error_count": error_count,
        }
    if warning_count:
        return {
            "type": "warning",
            "message": "Warning - review highlighted assumptions or risky lines",
            "details": f"{language} - {len(lines)} lines - {warning_count} warning",
            "language": language,
            "line_count": len(lines),
            "warning_count": warning_count,
            "error_count": 0,
        }
    return {
        "type": "success",
        "message": "Looks good! The code structure appears coherent",
        "details": f"{language} - {len(lines)} lines - 0 bugs",
        "language": language,
        "line_count": len(lines),
        "warning_count": 0,
        "error_count": 0,
    }


def function_count(code: str) -> int:
    return len(re.findall(r"^\s*(def |function |public .*?\()", code, re.MULTILINE))


def detected_algorithms(code: str) -> list[dict]:
    lowered = code.lower()
    algorithms: list[dict] = []
    if "binary_search" in lowered or ("left" in lowered and "right" in lowered and "mid" in lowered):
        algorithms.append({"name": "Binary Search", "complexity": "O(log n)", "type": "Divide and Conquer", "confidence": 0.96})
    if "bubble" in lowered or ("sort" in lowered and "swap" in lowered):
        algorithms.append({"name": "Bubble Sort", "complexity": "O(n^2)", "type": "Sorting", "confidence": 0.84})
    if "dfs" in lowered or ("stack" in lowered and "graph" in lowered):
        algorithms.append({"name": "Depth First Search", "complexity": "O(V + E)", "type": "Graph Traversal", "confidence": 0.82})
    if "bfs" in lowered or ("queue" in lowered and "graph" in lowered):
        algorithms.append({"name": "Breadth First Search", "complexity": "O(V + E)", "type": "Graph Traversal", "confidence": 0.82})
    if not algorithms and ("for " in lowered or "while " in lowered):
        algorithms.append({"name": "Iterative Traversal", "complexity": "O(n)", "type": "Iteration", "confidence": 0.62})
    return algorithms


def complexity_metrics(code: str) -> list[dict]:
    lowered = code.lower()
    return [
        {"name": "Functions", "value": function_count(code)},
        {"name": "Loops", "value": len(re.findall(r"\b(for|while)\b", lowered))},
        {"name": "Conditions", "value": len(re.findall(r"\b(if|elif|else|switch)\b", lowered))},
        {"name": "Recursion", "value": max(len(re.findall(r"\breturn\b", lowered)) - 1, 0)},
    ]


def quality_score(code: str) -> int:
    score = 78
    if detect_bugs(code):
        score -= 18
    if detect_assumptions(code):
        score -= 4
    if '"""' in code or "/**" in code or "#" in code:
        score += 6
    if function_count(code) > 0:
        score += 4
    return max(0, min(score, 98))


def style_summary(language: str, code: str) -> str:
    if language == "Python":
        return "Mostly Pythonic structure with room for stronger validation and docstrings."
    if language == "JavaScript":
        return "Reasonably modern JavaScript style with opportunities for stronger typing and error handling."
    return f"Readable {language} code with standard control-flow patterns."


def documentation_status(code: str) -> str:
    if '"""' in code or "/**" in code:
        return "Documented"
    if "#" in code or "//" in code:
        return "Partially documented"
    return "Needs Improvement"


def suggestions(code: str) -> list[dict]:
    items: list[dict] = []
    if "mid =" in code:
        items.append(
            {
                "type": "performance",
                "priority": "medium",
                "title": "Use overflow-safe midpoint calculation",
                "description": "Prefer left + (right - left) // 2 in languages with fixed-width integers.",
            }
        )
    if documentation_status(code) == "Needs Improvement":
        items.append(
            {
                "type": "readability",
                "priority": "low",
                "title": "Add docstrings or comments",
                "description": "A small amount of intent-level documentation will make the code easier to maintain.",
            }
        )
    if detect_assumptions(code):
        items.append(
            {
                "type": "best-practice",
                "priority": "high",
                "title": "Validate important assumptions",
                "description": "Guard sorted input, index bounds, and external input format before the main logic runs.",
            }
        )
    return items[:4]


def mentor_chat_answer(code: str, language: str, message: str) -> dict:
    lower_message = message.lower()
    if "complex" in lower_message or "time complexity" in lower_message:
        detected = detected_algorithms(code)
        if detected:
            answer = f"The strongest match in this {language} code is {detected[0]['name']} with estimated complexity {detected[0]['complexity']}."
        else:
            answer = "The code appears mostly iterative, so the runtime likely scales with the number of processed elements."
    elif "bug" in lower_message or "wrong" in lower_message:
        bugs = detect_bugs(code)
        answer = bugs[0]["description"] if bugs else "I do not see a clear critical bug from the static scan, but input validation and boundary checks would still help."
    else:
        answer = f"{summarize_code(code, language)} The main areas to review next are assumptions, edge cases, and test coverage."
    return {
        "answer": answer,
        "citations": [],
        "follow_ups": [
            "Ask for a line-by-line explanation",
            "Ask for bug risks and edge cases",
        ],
    }
