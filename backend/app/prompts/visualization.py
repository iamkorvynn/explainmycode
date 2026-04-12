from __future__ import annotations

import json
from typing import Any

VISUALIZATION_GENERATION_PROMPT = """
You are ExplainMyCode's algorithm visualization engine.
Return valid JSON only. Do not wrap the JSON in markdown fences.
Build a concise, developer-friendly walkthrough that can be rendered as an animation timeline.
Prefer concrete state snapshots over vague narration.
"""

_MAX_CODE_CHARS = 12000


def build_visualization_prompt(
    language: str,
    code: str,
    algorithm_name: str | None,
    prompt: str | None,
    heuristic_snapshot: dict[str, Any],
) -> str:
    response_shape = {
        "algorithm": "merge-sort",
        "title": "Merge Sort",
        "description": "Short explanation of what the algorithm is doing.",
        "visualization_type": "array",
        "steps": [
            {
                "index": 0,
                "label": "Split the array",
                "narration": "Break the input into smaller halves before combining them again.",
                "state": {
                    "variables": [{"name": "depth", "value": "0"}],
                    "collections": [
                        {
                            "label": "Working Array",
                            "layout": "array",
                            "items": [
                                {"label": "0", "value": "8", "status": "active"},
                                {"label": "1", "value": "3", "status": "candidate"},
                            ],
                        }
                    ],
                    "focus": ["The algorithm is narrowing the problem into smaller chunks."],
                    "notes": ["Use simple, UI-friendly states."],
                },
            }
        ],
    }
    return "\n".join(
        [
            "Task: visualization",
            f"Language: {language}",
            f"Algorithm name hint: {(algorithm_name or 'Not provided').strip()}",
            f"Scratch prompt hint: {(prompt or 'Not provided').strip()}",
            "Instructions:",
            "- Keep the response to 3-10 meaningful steps.",
            "- Every step must include index, label, narration, and a state object.",
            "- state may include variables, collections, graph, call_stack, focus, and notes.",
            "- collections should be easy to render: include label, layout, and items.",
            "- item status values should stay short, like active, sorted, pivot, visited, frontier, done, candidate, boundary, or dimmed.",
            "- Prefer snapshots that explain how the algorithm evolves over time.",
            "- Stay grounded in the provided code when code is available.",
            "Return JSON shape:",
            json.dumps(response_shape, indent=2),
            "Helpful heuristic seed data:",
            json.dumps(heuristic_snapshot, indent=2),
            "Code:",
            _trim_code(code),
        ]
    )


def _trim_code(code: str) -> str:
    if len(code) <= _MAX_CODE_CHARS:
        return code
    return f"{code[:_MAX_CODE_CHARS].rstrip()}\n... [truncated after {_MAX_CODE_CHARS} characters]"
