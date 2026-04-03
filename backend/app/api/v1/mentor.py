from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.mentor import (
    AssumptionsResponse,
    BugsResponse,
    CodeRequest,
    ExplanationResponse,
    LineExplanationRequest,
    LineExplanationResponse,
    LiveCommentsResponse,
    MentorChatRequest,
    MentorChatResponse,
    OnTrackResponse,
    SummaryResponse,
)
from app.services.mentor import MentorAnalysisService

router = APIRouter()


@router.post("/live-comments", response_model=LiveCommentsResponse)
def live_comments(payload: CodeRequest, _: User = Depends(get_current_user), db: Session = Depends(get_db)) -> LiveCommentsResponse:
    return MentorAnalysisService(db).live_comments(payload.code, payload.language)


@router.post("/summary", response_model=SummaryResponse)
def summary(payload: CodeRequest, _: User = Depends(get_current_user), db: Session = Depends(get_db)) -> SummaryResponse:
    return MentorAnalysisService(db).summary(payload.code, payload.language)


@router.post("/explanation", response_model=ExplanationResponse)
def explanation(payload: CodeRequest, _: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ExplanationResponse:
    return MentorAnalysisService(db).explanation(payload.code, payload.language)


@router.post("/line-explanation", response_model=LineExplanationResponse)
def line_explanation(
    payload: LineExplanationRequest,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LineExplanationResponse:
    return MentorAnalysisService(db).line_explanation(payload.code, payload.language, payload.line_number)


@router.post("/bugs", response_model=BugsResponse)
def bugs(payload: CodeRequest, _: User = Depends(get_current_user), db: Session = Depends(get_db)) -> BugsResponse:
    return MentorAnalysisService(db).bugs(payload.code, payload.language)


@router.post("/assumptions", response_model=AssumptionsResponse)
def assumptions(payload: CodeRequest, _: User = Depends(get_current_user), db: Session = Depends(get_db)) -> AssumptionsResponse:
    return MentorAnalysisService(db).assumptions(payload.code, payload.language)


@router.post("/on-track", response_model=OnTrackResponse)
def on_track(payload: CodeRequest, _: User = Depends(get_current_user), db: Session = Depends(get_db)) -> OnTrackResponse:
    return MentorAnalysisService(db).on_track(payload.code, payload.language)


@router.post("/chat", response_model=MentorChatResponse)
def mentor_chat(payload: MentorChatRequest, _: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MentorChatResponse:
    return MentorAnalysisService(db).chat(payload.code, payload.language, payload.message, payload.history)
