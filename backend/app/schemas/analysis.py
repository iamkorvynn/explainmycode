from app.schemas.common import APIModel


class MetricItem(APIModel):
    total_lines: int
    functions: int
    algorithms: int
    quality_score: int


class SummaryItem(APIModel):
    primary_language: str
    code_style: str
    documentation_status: str


class AlgorithmItem(APIModel):
    name: str
    complexity: str
    type: str
    confidence: float


class ComplexityMetric(APIModel):
    name: str
    value: int


class ComplexitySummary(APIModel):
    time: str
    space: str
    metrics: list[ComplexityMetric]


class SuggestionItem(APIModel):
    type: str
    priority: str
    title: str
    description: str


class DashboardResponse(APIModel):
    metrics: MetricItem
    summary: SummaryItem
    detected_algorithms: list[AlgorithmItem]
    complexity: ComplexitySummary
    suggestions: list[SuggestionItem]
    provider: str
