from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.visualization import VisualizationDetail, VisualizationSummary
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
