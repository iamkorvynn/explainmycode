from sqlalchemy.orm import Session

from app.models.execution import Execution


class ExecutionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> Execution:
        execution = Execution(**kwargs)
        self.db.add(execution)
        self.db.flush()
        return execution
