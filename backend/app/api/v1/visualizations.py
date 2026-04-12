from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.visualization import VisualizationDetail, VisualizationGenerateRequest, VisualizationSummary
from app.services.visualization import VisualizationService

router = APIRouter()


@router.get("", response_model=list[VisualizationSummary])
def list_visualizations(_: User = Depends(get_current_user)) -> list[VisualizationSummary]:
    return VisualizationService().list_visualizations()


@router.get("/{algorithm_id}", response_model=VisualizationDetail)
def get_visualization(algorithm_id: str, _: User = Depends(get_current_user)) -> VisualizationDetail:
    try:
        return VisualizationService().get_visualization(algorithm_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Visualization not found") from exc


@router.post("/generate", response_model=VisualizationDetail)
def generate_visualization(payload: VisualizationGenerateRequest, _: User = Depends(get_current_user)) -> VisualizationDetail:
    return VisualizationService().generate_visualization(
        code=payload.code or "",
        language=payload.language,
        algorithm_name=payload.algorithm_name,
        prompt=payload.prompt,
    )
