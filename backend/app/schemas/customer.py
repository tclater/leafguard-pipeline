from pydantic import BaseModel
from typing import Literal


Priority = Literal["high", "medium", "low"]


class CustomerBase(BaseModel):
    name: str
    company: str = ""
    value: float = 0.0
    stage_id: str
    rep: str = ""
    last_contact: str = ""
    hours_in_stage: int = 0
    priority: Priority = "medium"


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = None
    company: str | None = None
    value: float | None = None
    stage_id: str | None = None
    rep: str | None = None
    last_contact: str | None = None
    hours_in_stage: int | None = None
    priority: Priority | None = None


class CustomerRead(CustomerBase):
    id: int

    model_config = {"from_attributes": True}


class CustomerList(BaseModel):
    items: list[CustomerRead]
    total: int
    page: int
    page_size: int
    pages: int
