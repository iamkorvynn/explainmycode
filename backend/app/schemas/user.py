from datetime import datetime

from app.schemas.common import APIModel


class UserResponse(APIModel):
    id: str
    username: str
    email: str
    phone: str | None = None
    full_name: str | None = None
    is_active: bool
    created_at: datetime
