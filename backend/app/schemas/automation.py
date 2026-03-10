from pydantic import BaseModel
from typing import Literal


ActionType = Literal["email", "sms", "task", "calendar", "integration", "notification"]


class AutomationBase(BaseModel):
    icon: str = "Mail"
    name: str
    trigger: str
    action_type: ActionType
    description: str = ""


class AutomationCreate(AutomationBase):
    pass


class AutomationUpdate(BaseModel):
    icon: str | None = None
    name: str | None = None
    trigger: str | None = None
    action_type: ActionType | None = None
    description: str | None = None


class AutomationRead(AutomationBase):
    id: int
    stage_id: str

    model_config = {"from_attributes": True}
