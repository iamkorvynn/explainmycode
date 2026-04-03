from app.schemas.common import APIModel


class VisualizationSummary(APIModel):
    id: str
    title: str
    description: str


class VisualizationStep(APIModel):
    index: int
    label: str
    state: dict


class VisualizationDetail(APIModel):
    algorithm: str
    title: str
    description: str
    steps: list[VisualizationStep]
