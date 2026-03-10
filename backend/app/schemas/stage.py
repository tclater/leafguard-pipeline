from pydantic import BaseModel, computed_field
from app.schemas.automation import AutomationRead


class StageBase(BaseModel):
    name: str
    color: str = "bg-blue-500"
    velocity: float = 0.0
    conversion_rate: float = 0.0
    avg_time_in_stage: float = 0.0
    stagnant: int = 0
    sort_order: int = 0


class StageCreate(StageBase):
    id: str


class StageUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    velocity: float | None = None
    conversion_rate: float | None = None
    avg_time_in_stage: float | None = None
    stagnant: int | None = None
    sort_order: int | None = None


class StageRead(StageBase):
    id: str
    automations: list[AutomationRead] = []
    count: int = 0

    model_config = {"from_attributes": True}
