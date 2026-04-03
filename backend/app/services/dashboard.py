from app.schemas.analysis import DashboardResponse
from app.services.analysis_utils import (
    complexity_metrics,
    detected_algorithms,
    detect_language,
    documentation_status,
    function_count,
    non_empty_lines,
    quality_score,
    style_summary,
    suggestions,
)


class DashboardAnalysisService:
    def build_dashboard(self, code: str, language: str) -> DashboardResponse:
        resolved_language = detect_language(code, language)
        algorithms = detected_algorithms(code)
        metrics = complexity_metrics(code)
        line_count = len(non_empty_lines(code))
        time_complexity = algorithms[0]["complexity"] if algorithms else "O(n)"
        space_complexity = "O(1)" if "recurs" not in code.lower() else "O(n)"
        return DashboardResponse(
            metrics={
                "total_lines": line_count,
                "functions": function_count(code),
                "algorithms": len(algorithms),
                "quality_score": quality_score(code),
            },
            summary={
                "primary_language": resolved_language,
                "code_style": style_summary(resolved_language, code),
                "documentation_status": documentation_status(code),
            },
            detected_algorithms=algorithms,
            complexity={"time": time_complexity, "space": space_complexity, "metrics": metrics},
            suggestions=suggestions(code),
            provider="mock",
        )
