from __future__ import annotations

import re


def looks_like_interactive_input(source_code: str, language: str) -> bool:
    normalized = language.lower()
    if normalized in {"python", "py"}:
        return "input(" in source_code
    if normalized in {"javascript", "js", "typescript", "ts"}:
        return "prompt(" in source_code or "readline" in source_code.lower()
    if normalized in {"java"}:
        return "scanner" in source_code.lower() or "bufferedreader" in source_code.lower()
    if normalized in {"cpp", "c++"}:
        return "cin >>" in source_code or "getline(cin" in source_code.replace(" ", "")
    return bool(re.search(r"\bstdin\b", source_code, re.IGNORECASE))


def missing_input_message() -> str:
    return "Program is waiting for stdin input. Add input in the terminal panel and run again."
