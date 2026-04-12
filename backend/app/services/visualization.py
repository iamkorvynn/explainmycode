from __future__ import annotations

import re
from typing import Any

from app.prompts.visualization import VISUALIZATION_GENERATION_PROMPT, build_visualization_prompt
from app.schemas.visualization import VisualizationDetail, VisualizationStep, VisualizationSummary
from app.services.analysis_utils import detect_language, detected_algorithms, split_sections, summarize_code
from app.services.live_llm import LiveLLMClient


class VisualizationService:
    def __init__(self):
        self.live_llm = LiveLLMClient()

    def list_visualizations(self) -> list[VisualizationSummary]:
        return [
            VisualizationSummary(id="bubble-sort", title="Bubble Sort", description="Adjacent comparisons and swaps.", category="Sorting"),
            VisualizationSummary(id="binary-search", title="Binary Search", description="Halve the search window in a sorted array.", category="Searching"),
            VisualizationSummary(id="merge-sort", title="Merge Sort", description="Split the array, then merge ordered halves.", category="Sorting"),
            VisualizationSummary(id="quick-sort", title="Quick Sort", description="Partition around a pivot, then recurse.", category="Sorting"),
            VisualizationSummary(id="breadth-first-search", title="Breadth-First Search", description="Visit a graph level by level with a queue.", category="Graph"),
            VisualizationSummary(id="depth-first-search", title="Depth-First Search", description="Dive down one branch before backtracking.", category="Graph"),
            VisualizationSummary(id="fibonacci-recursion", title="Fibonacci Recursion", description="Expand recursive calls into smaller subproblems.", category="Recursion"),
        ]

    def get_visualization(self, algorithm_id: str) -> VisualizationDetail:
        detail = self._template_map().get(algorithm_id)
        if not detail:
            raise KeyError(algorithm_id)
        return detail.model_copy(update={"source": "template", "provider": "mock"})

    def generate_visualization(
        self,
        *,
        code: str,
        language: str,
        algorithm_name: str | None = None,
        prompt: str | None = None,
    ) -> VisualizationDetail:
        resolved_language = detect_language(code, language)
        fallback = self._generated_detail(code=code, language=resolved_language, algorithm_name=algorithm_name, prompt=prompt)
        payload, provider = self.live_llm.generate_json(
            preferred="claude",
            system_prompt=VISUALIZATION_GENERATION_PROMPT,
            user_prompt=build_visualization_prompt(resolved_language, code, algorithm_name, prompt, fallback.model_dump()),
        )
        if not payload:
            return fallback
        detail = self._sanitize_generated_payload(payload, fallback)
        return detail.model_copy(update={"provider": provider, "source": "generated"})

    def _generated_detail(self, *, code: str, language: str, algorithm_name: str | None, prompt: str | None) -> VisualizationDetail:
        key = self._detect_algorithm_key(code, algorithm_name, prompt)
        template = self._template_map().get(key or "")
        if template:
            return template.model_copy(
                update={
                    "source": "generated",
                    "provider": "mock",
                    "description": self._generated_description(template.title, code, prompt, language),
                }
            )
        return self._generic_detail(code=code, language=language, algorithm_name=algorithm_name, prompt=prompt)

    def _template_map(self) -> dict[str, VisualizationDetail]:
        return {
            "bubble-sort": self._detail(
                "bubble-sort",
                "Bubble Sort",
                "A comparison-based sort that repeatedly swaps adjacent out-of-order values.",
                "array",
                self._bubble_sort_steps(),
            ),
            "binary-search": self._detail(
                "binary-search",
                "Binary Search",
                "Searches a sorted array by repeatedly halving the candidate range.",
                "array",
                self._binary_search_steps(),
            ),
            "merge-sort": self._detail(
                "merge-sort",
                "Merge Sort",
                "Divides the input into halves, then merges sorted fragments back together.",
                "array",
                self._merge_sort_steps(),
            ),
            "quick-sort": self._detail(
                "quick-sort",
                "Quick Sort",
                "Partitions values around a pivot and recurses on both sides.",
                "array",
                self._quick_sort_steps(),
            ),
            "breadth-first-search": self._detail(
                "breadth-first-search",
                "Breadth-First Search",
                "Visits graph nodes level by level using a queue frontier.",
                "graph",
                self._bfs_steps(),
            ),
            "depth-first-search": self._detail(
                "depth-first-search",
                "Depth-First Search",
                "Follows one branch deeply before backtracking to alternatives.",
                "graph",
                self._dfs_steps(),
            ),
            "fibonacci-recursion": self._detail(
                "fibonacci-recursion",
                "Fibonacci Recursion",
                "Expands each call into smaller subproblems until base cases resolve.",
                "recursion",
                self._fibonacci_steps(),
            ),
            "graph-traversal": self._detail(
                "breadth-first-search",
                "Breadth-First Search",
                "Visits graph nodes level by level using a queue frontier.",
                "graph",
                self._bfs_steps(),
            ),
        }

    def _detect_algorithm_key(self, code: str, algorithm_name: str | None, prompt: str | None) -> str | None:
        combined = " ".join(part for part in [algorithm_name or "", prompt or "", code] if part).lower()
        rules = [
            ("binary-search", [r"binary[\s_-]?search", r"\bmid\b"]),
            ("bubble-sort", [r"bubble[\s_-]?sort", r"\bswap\b"]),
            ("merge-sort", [r"merge[\s_-]?sort"]),
            ("quick-sort", [r"quick[\s_-]?sort", r"\bpivot\b"]),
            ("breadth-first-search", [r"\bbfs\b", r"\bqueue\b", r"breadth[\s_-]?first"]),
            ("depth-first-search", [r"\bdfs\b", r"\bstack\b", r"depth[\s_-]?first"]),
            ("fibonacci-recursion", [r"\bfibonacci\b", r"\bfib\(", r"\brecursive\b"]),
        ]
        for key, patterns in rules:
            if any(re.search(pattern, combined) for pattern in patterns):
                return key
        return None

    def _generated_description(self, title: str, code: str, prompt: str | None, language: str) -> str:
        if code.strip():
            return f"Generated from the current {language} code. {summarize_code(code, language)}"
        if prompt and prompt.strip():
            return f"Created from scratch for {title} using your prompt: {prompt.strip()}"
        return f"Generated walkthrough for {title}."

    def _generic_detail(self, *, code: str, language: str, algorithm_name: str | None, prompt: str | None) -> VisualizationDetail:
        title = self._generic_title(code, algorithm_name, prompt)
        description = (
            f"Generated from the current {language} code. {summarize_code(code, language)}"
            if code.strip()
            else f"Created from scratch for {title}. The walkthrough focuses on main phases and state changes."
        )
        steps = self._generic_steps_from_code(code, language) if code.strip() else self._generic_steps_from_prompt(title, prompt)
        return self._detail(self._slugify(title), title, description, "generic", steps, source="generated")

    def _generic_title(self, code: str, algorithm_name: str | None, prompt: str | None) -> str:
        if algorithm_name and algorithm_name.strip():
            return algorithm_name.strip().title()
        matches = detected_algorithms(code)
        if matches:
            return matches[0]["name"]
        if prompt and prompt.strip():
            return prompt.strip()[:80].strip().title()
        return "Custom Algorithm"

    def _generic_steps_from_code(self, code: str, language: str) -> list[VisualizationStep]:
        lines = code.splitlines()
        variables = self._extract_assignments(code)
        sections = split_sections(code)[:5] or [{"title": "Overview", "start_line": 1, "end_line": len(lines), "summary": "Walk through the code from top to bottom."}]
        steps = []
        for index, section in enumerate(sections):
            snippet = [line.strip() for line in lines[section["start_line"] - 1 : section["end_line"]] if line.strip()]
            steps.append(
                VisualizationStep(
                    index=index,
                    label=section["title"],
                    narration=f"Lines {section['start_line']}-{section['end_line']}: {section['summary']}",
                    state={"variables": [{"name": "language", "value": language}, *variables[:4]], "focus": [f"Inspect the {section['title'].lower()} phase."], "notes": snippet[:3]},
                )
            )
        return steps

    def _generic_steps_from_prompt(self, title: str, prompt: str | None) -> list[VisualizationStep]:
        prompt_text = (prompt or title).strip()
        return [
            VisualizationStep(index=0, label="Define the goal", narration=f"Clarify what {title} computes and what success looks like.", state={"variables": [{"name": "goal", "value": title}], "notes": [prompt_text], "focus": ["Start with inputs, outputs, and constraints."]}),
            VisualizationStep(index=1, label="Choose the working state", narration="Set up the variables or data structures that will change as the algorithm runs.", state={"variables": [{"name": "state", "value": "initialized"}, {"name": "next_action", "value": "compute"}], "focus": ["Track the few pieces of state that drive each transition."], "notes": ["Pointers, queues, stacks, or partial results usually matter most."]}),
            VisualizationStep(index=2, label="Apply the core rule", narration=f"Run the main decision rule for {title} and update the state after each step.", state={"collections": [{"label": "State Changes", "layout": "array", "items": [{"label": "1", "value": "Read input", "status": "done"}, {"label": "2", "value": "Choose action", "status": "active"}, {"label": "3", "value": "Update state", "status": "candidate"}]}], "focus": ["Each update should move the algorithm closer to the final result."], "notes": ["This is the step the animation should emphasize most."]}),
            VisualizationStep(index=3, label="Stop and return", narration="Finish once the termination condition is satisfied and emit the final result.", state={"variables": [{"name": "result", "value": "ready"}], "focus": ["Show why the algorithm can stop here."], "notes": ["Return the completed structure, answer, or traversal order."]}),
        ]

    def _sanitize_generated_payload(self, value: Any, fallback: VisualizationDetail) -> VisualizationDetail:
        if not isinstance(value, dict):
            return fallback
        steps = self._sanitize_steps(value.get("steps"), fallback.steps)
        if not steps:
            return fallback
        return VisualizationDetail(
            algorithm=self._text(value.get("algorithm"), fallback.algorithm),
            title=self._text(value.get("title"), fallback.title),
            description=self._text(value.get("description"), fallback.description),
            visualization_type=self._enum(value.get("visualization_type"), {"array", "graph", "recursion", "generic"}, fallback.visualization_type),
            source="generated",
            provider=fallback.provider,
            steps=steps,
        )

    def _sanitize_steps(self, value: Any, fallback: list[VisualizationStep]) -> list[VisualizationStep]:
        if not isinstance(value, list):
            return fallback
        steps = []
        for index, item in enumerate(value[:12]):
            if not isinstance(item, dict):
                continue
            steps.append(VisualizationStep(index=index, label=self._text(item.get("label"), f"Step {index + 1}"), narration=self._text(item.get("narration"), f"Step {index + 1}"), state=item.get("state") if isinstance(item.get("state"), dict) else {}))
        return steps or fallback

    @staticmethod
    def _detail(algorithm: str, title: str, description: str, visualization_type: str, steps: list[VisualizationStep], *, source: str = "template") -> VisualizationDetail:
        return VisualizationDetail(algorithm=algorithm, title=title, description=description, visualization_type=visualization_type, source=source, provider="mock", steps=steps)

    @staticmethod
    def _text(value: Any, default: str) -> str:
        return value.strip() if isinstance(value, str) and value.strip() else default

    @staticmethod
    def _enum(value: Any, allowed: set[str], default: str) -> str:
        if isinstance(value, str) and value.strip().lower() in allowed:
            return value.strip().lower()
        return default

    @staticmethod
    def _slugify(value: str) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower())
        return slug.strip("-") or "custom-algorithm"

    @staticmethod
    def _extract_assignments(code: str) -> list[dict[str, str]]:
        return [{"name": name, "value": expr.strip()[:40]} for name, expr in re.findall(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$", code, re.MULTILINE)[:6]]

    @staticmethod
    def _array(label: str, values: list[int | str], *, active: set[int] | None = None, sorted_indexes: set[int] | None = None, boundary: set[int] | None = None, pivot: int | None = None, visited: set[int] | None = None, frontier: set[int] | None = None, dimmed: set[int] | None = None) -> dict[str, Any]:
        active, sorted_indexes, boundary, visited, frontier, dimmed = active or set(), sorted_indexes or set(), boundary or set(), visited or set(), frontier or set(), dimmed or set()
        items = []
        for index, value in enumerate(values):
            status = "default"
            if index in dimmed: status = "dimmed"
            if index in boundary: status = "boundary"
            if index in frontier: status = "frontier"
            if index in visited: status = "visited"
            if pivot is not None and index == pivot: status = "pivot"
            if index in sorted_indexes: status = "sorted"
            if index in active: status = "active"
            items.append({"label": str(index), "value": str(value), "status": status})
        return {"label": label, "layout": "array", "items": items}

    @staticmethod
    def _graph(nodes: list[tuple[str, str]], edges: list[tuple[str, str]]) -> dict[str, Any]:
        return {"nodes": [{"id": node_id, "label": node_id, "status": status} for node_id, status in nodes], "edges": [{"from": src, "to": dst} for src, dst in edges]}

    def _bubble_sort_steps(self) -> list[VisualizationStep]:
        return [VisualizationStep(index=0, label="Compare neighbors", narration="Look at adjacent items and check whether they are out of order.", state={"variables": [{"name": "pass", "value": "1"}], "collections": [self._array("Working Array", [8, 3, 5, 1, 4], active={0, 1})], "notes": ["Bubble sort only compares neighboring values."]}), VisualizationStep(index=1, label="Swap out-of-order pair", narration="Swap the pair so the larger value moves right.", state={"collections": [self._array("Working Array", [3, 8, 5, 1, 4], active={0, 1})], "focus": ["The largest unsorted value keeps drifting toward the end."]}), VisualizationStep(index=2, label="End the pass", narration="After one full pass, the largest remaining value is in final position.", state={"collections": [self._array("Working Array", [3, 5, 1, 4, 8], sorted_indexes={4}, active={2, 3})], "notes": ["The sorted tail grows from right to left."]}), VisualizationStep(index=3, label="Finish sorted output", narration="Repeat passes until no unsorted boundary remains.", state={"collections": [self._array("Sorted Array", [1, 3, 4, 5, 8], sorted_indexes={0, 1, 2, 3, 4})], "focus": ["Bubble sort is simple but quadratic on large inputs."]})]

    def _binary_search_steps(self) -> list[VisualizationStep]:
        return [VisualizationStep(index=0, label="Choose the midpoint", narration="Inspect the middle value of the current search window.", state={"variables": [{"name": "left", "value": "0"}, {"name": "mid", "value": "3"}, {"name": "right", "value": "6"}, {"name": "target", "value": "12"}], "collections": [self._array("Sorted Array", [1, 4, 7, 9, 12, 15, 20], active={3}, boundary={0, 6})], "notes": ["Everything outside the current window is already irrelevant."]}), VisualizationStep(index=1, label="Discard half the range", narration="The midpoint is too small, so shift the left boundary past it.", state={"variables": [{"name": "left", "value": "4"}, {"name": "right", "value": "6"}], "collections": [self._array("Sorted Array", [1, 4, 7, 9, 12, 15, 20], boundary={4, 6}, dimmed={0, 1, 2, 3})], "focus": ["Binary search only keeps the half that can still contain the target."]}), VisualizationStep(index=2, label="Match the target", narration="The new midpoint equals the target, so the search stops.", state={"variables": [{"name": "mid", "value": "4"}, {"name": "found_index", "value": "4"}], "collections": [self._array("Sorted Array", [1, 4, 7, 9, 12, 15, 20], active={4}, dimmed={0, 1, 2, 3})], "notes": ["The algorithm finishes as soon as midpoint == target."]})]

    def _merge_sort_steps(self) -> list[VisualizationStep]:
        return [VisualizationStep(index=0, label="Split into halves", narration="Break the input into smaller halves until only single items remain.", state={"collections": [self._array("Left Half", [8, 3, 5], active={0, 1, 2}), self._array("Right Half", [1, 4, 7], active={0, 1, 2})], "notes": ["The divide phase creates smaller independent subproblems."]}), VisualizationStep(index=1, label="Reach base cases", narration="Single-item arrays are already sorted and can start merging upward.", state={"collections": [{"label": "Singles", "layout": "array", "items": [{"label": str(i), "value": str(value), "status": "done"} for i, value in enumerate([8, 3, 5, 1, 4, 7])]}], "focus": ["No comparisons are needed for a one-item array."]}), VisualizationStep(index=2, label="Merge ordered fragments", narration="Compare the front values of each sorted half and copy the smaller one into the merged output.", state={"variables": [{"name": "left_cursor", "value": "0"}, {"name": "right_cursor", "value": "0"}], "collections": [self._array("Left", [3, 5, 8], active={0}), self._array("Right", [1, 4, 7], active={0}), self._array("Merged", [1, 3, 4, 5, 7, 8], sorted_indexes={0, 1, 2, 3, 4, 5})], "notes": ["Merge sort keeps the ordering stable while combining halves."]})]

    def _quick_sort_steps(self) -> list[VisualizationStep]:
        return [VisualizationStep(index=0, label="Pick a pivot", narration="Select a pivot that will split the array into smaller and larger regions.", state={"variables": [{"name": "pivot", "value": "4"}], "collections": [self._array("Input", [8, 3, 5, 1, 4, 7], pivot=4)], "notes": ["Pivot choice strongly affects quick sort's real-world performance."]}), VisualizationStep(index=1, label="Partition around the pivot", narration="Move values smaller than the pivot to the left and larger values to the right.", state={"collections": [self._array("Partitioned", [3, 1, 4, 8, 5, 7], pivot=2, active={0, 1, 2})], "focus": ["Once partitioning ends, the pivot is already in final position."]}), VisualizationStep(index=2, label="Recurse on both sides", narration="Apply the same pivot-and-partition logic to each remaining region.", state={"call_stack": ["quick_sort([3, 1])", "quick_sort([8, 5, 7])"], "collections": [self._array("Sorted Output", [1, 3, 4, 5, 7, 8], sorted_indexes={0, 1, 2, 3, 4, 5})], "notes": ["No extra merge phase is needed after the recursive calls finish."]})]

    def _bfs_steps(self) -> list[VisualizationStep]:
        edges = [("A", "B"), ("A", "C"), ("B", "D"), ("C", "E"), ("C", "F")]
        return [VisualizationStep(index=0, label="Initialize the queue", narration="Start at A, mark it visited, and put it in the queue.", state={"graph": self._graph([("A", "frontier"), ("B", "default"), ("C", "default"), ("D", "default"), ("E", "default"), ("F", "default")], edges), "collections": [{"label": "Queue", "layout": "array", "items": [{"label": "0", "value": "A", "status": "active"}]}], "notes": ["BFS explores the nearest neighbors first."]}), VisualizationStep(index=1, label="Expand the first layer", narration="Dequeue A and enqueue its unvisited neighbors B and C.", state={"graph": self._graph([("A", "visited"), ("B", "frontier"), ("C", "frontier"), ("D", "default"), ("E", "default"), ("F", "default")], edges), "collections": [{"label": "Queue", "layout": "array", "items": [{"label": "0", "value": "B", "status": "frontier"}, {"label": "1", "value": "C", "status": "frontier"}]}], "focus": ["The queue preserves breadth-first order across a whole level."]}), VisualizationStep(index=2, label="Continue until empty", narration="Process each queued node until there are no frontier nodes left.", state={"graph": self._graph([("A", "visited"), ("B", "visited"), ("C", "visited"), ("D", "visited"), ("E", "visited"), ("F", "visited")], edges), "collections": [{"label": "Queue", "layout": "array", "items": []}], "notes": ["An empty queue means every reachable node has been explored."]})]

    def _dfs_steps(self) -> list[VisualizationStep]:
        edges = [("A", "B"), ("A", "C"), ("B", "D"), ("C", "E"), ("C", "F")]
        return [VisualizationStep(index=0, label="Push the start node", narration="Begin with A on the stack and choose a branch to follow.", state={"graph": self._graph([("A", "frontier"), ("B", "default"), ("C", "default"), ("D", "default"), ("E", "default"), ("F", "default")], edges), "collections": [{"label": "Stack", "layout": "array", "items": [{"label": "top", "value": "A", "status": "active"}]}], "notes": ["DFS prioritizes depth over breadth."]}), VisualizationStep(index=1, label="Dive deeper", narration="Visit B and then D before considering siblings on the side.", state={"graph": self._graph([("A", "visited"), ("B", "visited"), ("C", "default"), ("D", "frontier"), ("E", "default"), ("F", "default")], edges), "collections": [{"label": "Stack", "layout": "array", "items": [{"label": "0", "value": "A", "status": "done"}, {"label": "1", "value": "B", "status": "done"}, {"label": "top", "value": "D", "status": "active"}]}], "call_stack": ["dfs(A)", "dfs(B)", "dfs(D)"]}), VisualizationStep(index=2, label="Backtrack and finish", narration="When a branch ends, pop back up and continue with the next unvisited branch.", state={"graph": self._graph([("A", "visited"), ("B", "visited"), ("C", "visited"), ("D", "visited"), ("E", "visited"), ("F", "visited")], edges), "collections": [{"label": "Stack", "layout": "array", "items": []}], "notes": ["DFS completes when the stack or recursion tree is empty."]})]

    def _fibonacci_steps(self) -> list[VisualizationStep]:
        return [VisualizationStep(index=0, label="Start fib(4)", narration="The top-level call expands into fib(3) and fib(2).", state={"call_stack": ["fib(4)"], "collections": [{"label": "Children", "layout": "array", "items": [{"label": "L", "value": "fib(3)", "status": "active"}, {"label": "R", "value": "fib(2)", "status": "candidate"}]}], "notes": ["Recursive definitions create a tree of smaller calls."]}), VisualizationStep(index=1, label="Expand until base cases", narration="Keep branching until fib(1) and fib(0) appear, because they return immediately.", state={"call_stack": ["fib(4)", "fib(3)", "fib(2)"], "collections": [{"label": "Resolved Calls", "layout": "array", "items": [{"label": "fib(1)", "value": "1", "status": "done"}, {"label": "fib(0)", "value": "0", "status": "done"}]}], "focus": ["Base cases anchor the whole recursion tree."]}), VisualizationStep(index=2, label="Combine child results", narration="Return upward by adding child answers until fib(4) resolves.", state={"call_stack": ["fib(4)"], "variables": [{"name": "fib(4)", "value": "3"}], "notes": ["Memoization avoids recomputing repeated subproblems."]})]
