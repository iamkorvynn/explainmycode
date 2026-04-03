from __future__ import annotations

import json
from typing import Any

DASHBOARD_ANALYSIS_PROMPT = """
You are ExplainMyCode's dashboard analysis engine.
Return valid JSON only. Do not wrap the JSON in markdown fences.
Keep the output concise, grounded in the code, and compatible with a developer-facing dashboard.
"""

_MAX_CODE_CHARS = 12000


def build_dashboard_prompt(language: str, code: str, heuristic_snapshot: dict[str, Any]) -> str:
    response_shape = {
        "summary": {
            "primary_language": language,
            "code_style": "Short description of the code style.",
            "documentation_status": "Documented",
        },
        "detected_algorithms": [
            {
                "name": "Binary Search",
                "complexity": "O(log n)",
                "type": "Divide and Conquer",
                "confidence": 0.96,
            }
        ],
        "complexity": {
            "time": "O(log n)",
            "space": "O(1)",
        },
        "suggestions": [
            {
                "type": "best-practice",
                "priority": "medium",
                "title": "Validate assumptions",
                "description": "Guard the critical assumptions before the main logic runs.",
            }
        ],
    }
    return "\n".join(
        [
            "Task: dashboard",
            f"Language: {language}",
            "Instructions:",
            "- Refine the dashboard narrative while staying consistent with the provided heuristic snapshot.",
            "- Keep detected_algorithms to the strongest 0-4 matches.",
            "- confidence must stay between 0 and 1.",
            "- suggestion priority must be one of high, medium, low.",
            "- Do not return metrics counts; they stay deterministic from the backend.",
            "Return JSON shape:",
            json.dumps(response_shape, indent=2),
            "Heuristic snapshot:",
            json.dumps(heuristic_snapshot, indent=2),
            "Code:",
            _trim_code(code),
        ]
    )


def _trim_code(code: str) -> str:
    if len(code) <= _MAX_CODE_CHARS:
        return code
    return f"{code[:_MAX_CODE_CHARS].rstrip()}\n... [truncated after {_MAX_CODE_CHARS} characters]"
