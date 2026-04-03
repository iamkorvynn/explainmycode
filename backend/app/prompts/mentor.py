from __future__ import annotations

import json
from typing import Any

FAST_ANALYSIS_PROMPT = """
You are ExplainMyCode's fast analysis engine.
Return valid JSON only. Do not wrap the JSON in markdown fences.
Ground every answer in the provided code and keep the output concise enough for direct UI rendering.
"""

DEEP_ANALYSIS_PROMPT = """
You are ExplainMyCode's senior AI mentor.
Return valid JSON only. Do not wrap the JSON in markdown fences.
Stay grounded in the provided code, call out real risks, and keep the language friendly but precise.
"""

_MAX_CODE_CHARS = 12000


def build_live_comments_prompt(language: str, code: str, heuristic_comments: list[dict[str, Any]]) -> str:
    return _task_prompt(
        task="live_comments",
        language=language,
        code=code,
        instructions=[
            "Return up to 15 comments that explain meaningful lines or flag risks.",
            "Every item in comments must include line, comment, and type.",
            "Allowed comment types: info, important, warning.",
            "Only use line numbers that exist in the code sample.",
        ],
        response_shape={
            "comments": [
                {"line": 3, "comment": "Loop iterates across the input.", "type": "info"},
            ]
        },
        heuristic_seed={"comments": heuristic_comments},
    )


def build_summary_prompt(language: str, code: str, heuristic_summary: str) -> str:
    return _task_prompt(
        task="summary",
        language=language,
        code=code,
        instructions=[
            "Write a concise summary of what the code does, how it is structured, and its main behavior.",
            "Keep the summary to 2-4 sentences.",
        ],
        response_shape={"summary": "Short explanation of the code."},
        heuristic_seed={"summary": heuristic_summary},
    )


def build_explanation_prompt(
    language: str,
    code: str,
    heuristic_sections: list[dict[str, Any]],
    heuristic_full_explanation: str,
) -> str:
    return _task_prompt(
        task="explanation",
        language=language,
        code=code,
        instructions=[
            "Break the code into 1-6 logical sections.",
            "For each section, include title, start_line, end_line, and a short summary.",
            "full_explanation should give a coherent top-down explanation of the code.",
            "Only use line ranges that exist in the code sample.",
        ],
        response_shape={
            "sections": [
                {"title": "Setup", "start_line": 1, "end_line": 4, "summary": "Prepares initial values."}
            ],
            "full_explanation": "Top-down explanation of the code.",
        },
        heuristic_seed={
            "sections": heuristic_sections,
            "full_explanation": heuristic_full_explanation,
        },
    )


def build_line_explanation_prompt(
    language: str,
    code: str,
    line_number: int,
    heuristic_result: dict[str, Any],
) -> str:
    return _task_prompt(
        task="line_explanation",
        language=language,
        code=code,
        instructions=[
            f"Explain line {line_number} in context.",
            "related_lines should list nearby line numbers that help explain the selected line.",
            "Only use line numbers that exist in the code sample.",
        ],
        response_shape={
            "line_number": line_number,
            "explanation": "What the selected line is doing.",
            "related_lines": [line_number - 1, line_number + 1],
        },
        heuristic_seed=heuristic_result,
    )


def build_bugs_prompt(language: str, code: str, heuristic_bugs: list[dict[str, Any]]) -> str:
    return _task_prompt(
        task="bugs",
        language=language,
        code=code,
        instructions=[
            "Return only plausible bugs, edge-case failures, or logic hazards grounded in the code.",
            "Each bug must include title, line, severity, category, description, and fix_suggestion.",
            "Allowed severities: low, medium, high.",
            "If no bug stands out, return an empty bugs list.",
        ],
        response_shape={
            "bugs": [
                {
                    "title": "Potential off-by-one error",
                    "line": 7,
                    "severity": "medium",
                    "category": "logic",
                    "description": "The loop can step past the final valid index.",
                    "fix_suggestion": "Stop iteration at len(items) instead of len(items) + 1.",
                }
            ]
        },
        heuristic_seed={"bugs": heuristic_bugs},
    )


def build_assumptions_prompt(language: str, code: str, heuristic_assumptions: list[dict[str, Any]]) -> str:
    return _task_prompt(
        task="assumptions",
        language=language,
        code=code,
        instructions=[
            "List the hidden assumptions the code relies on to work correctly.",
            "Each item must include title, category, and description.",
            "If there are no special assumptions, include the most important general input assumption.",
        ],
        response_shape={
            "assumptions": [
                {
                    "title": "Input is sorted",
                    "category": "data",
                    "description": "The algorithm only works when the data stays in sorted order.",
                }
            ]
        },
        heuristic_seed={"assumptions": heuristic_assumptions},
    )


def build_on_track_prompt(language: str, code: str, heuristic_status: dict[str, Any]) -> str:
    return _task_prompt(
        task="on_track",
        language=language,
        code=code,
        instructions=[
            "Return a short user-facing status update for the current code.",
            "type must be one of idle, success, warning, error.",
            "message should be a short headline. details should be a compact secondary explanation.",
            "Do not invent counts; the UI will keep the heuristic counts.",
        ],
        response_shape={
            "type": "warning",
            "message": "Review a risky edge case before moving on.",
            "details": "Static analysis found one meaningful warning to inspect.",
        },
        heuristic_seed=heuristic_status,
    )


def build_chat_prompt(
    language: str,
    code: str,
    message: str,
    history: list[dict[str, Any]],
    heuristic_answer: dict[str, Any],
) -> str:
    recent_history = history[-5:]
    return _task_prompt(
        task="chat",
        language=language,
        code=code,
        instructions=[
            "Answer the user's question directly and concisely.",
            "Use citations only when a specific line or code region materially supports the answer.",
            "Each citation item should include label, line, and reason.",
            "Provide 1-3 useful follow-up questions.",
        ],
        response_shape={
            "answer": "Direct answer to the user's question.",
            "citations": [{"label": "Line 4", "line": 4, "reason": "This branch handles the core comparison."}],
            "follow_ups": ["Ask for edge cases", "Ask for a line-by-line explanation"],
        },
        heuristic_seed={
            "question": message,
            "history": recent_history,
            "fallback": heuristic_answer,
        },
    )


def _task_prompt(
    *,
    task: str,
    language: str,
    code: str,
    instructions: list[str],
    response_shape: dict[str, Any],
    heuristic_seed: dict[str, Any],
) -> str:
    return "\n".join(
        [
            f"Task: {task}",
            f"Language: {language}",
            "Instructions:",
            *[f"- {instruction}" for instruction in instructions],
            "Return JSON shape:",
            json.dumps(response_shape, indent=2),
            "Helpful heuristic seed data:",
            json.dumps(heuristic_seed, indent=2),
            "Code:",
            _trim_code(code),
        ]
    )


def _trim_code(code: str) -> str:
    if len(code) <= _MAX_CODE_CHARS:
        return code
    return f"{code[:_MAX_CODE_CHARS].rstrip()}\n... [truncated after {_MAX_CODE_CHARS} characters]"
