from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Stage, Customer, Automation
from app.schemas import (
    StageRead, StageCreate, StageUpdate,
    AutomationRead, AutomationCreate, AutomationUpdate,
)

router = APIRouter(prefix="/stages", tags=["stages"])


def _get_stage_or_404(stage_id: str, db: Session) -> Stage:
    stage = db.get(Stage, stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return stage


@router.get("", response_model=list[StageRead])
def list_stages(db: Session = Depends(get_db)):
    stages = db.execute(
        select(Stage)
        .options(selectinload(Stage.automations), selectinload(Stage.customers))
        .order_by(Stage.sort_order)
    ).scalars().all()

    result = []
    for stage in stages:
        data = StageRead.model_validate(stage)
        data.count = len(stage.customers)
        result.append(data)
    return result


@router.post("", response_model=StageRead, status_code=201)
def create_stage(payload: StageCreate, db: Session = Depends(get_db)):
    if db.get(Stage, payload.id):
        raise HTTPException(status_code=409, detail="Stage ID already exists")
    stage = Stage(**payload.model_dump())
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return StageRead.model_validate(stage)


@router.get("/{stage_id}", response_model=StageRead)
def get_stage(stage_id: str, db: Session = Depends(get_db)):
    stage = db.execute(
        select(Stage)
        .where(Stage.id == stage_id)
        .options(selectinload(Stage.automations), selectinload(Stage.customers))
    ).scalar_one_or_none()
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    data = StageRead.model_validate(stage)
    data.count = len(stage.customers)
    return data


@router.patch("/{stage_id}", response_model=StageRead)
def update_stage(stage_id: str, payload: StageUpdate, db: Session = Depends(get_db)):
    stage = _get_stage_or_404(stage_id, db)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(stage, field, value)
    db.commit()
    db.refresh(stage)
    return StageRead.model_validate(stage)


@router.delete("/{stage_id}", status_code=204)
def delete_stage(stage_id: str, db: Session = Depends(get_db)):
    stage = _get_stage_or_404(stage_id, db)
    db.delete(stage)
    db.commit()


# ─── Automations nested under stages ──────────────────────────────────────────

@router.get("/{stage_id}/automations", response_model=list[AutomationRead])
def list_stage_automations(stage_id: str, db: Session = Depends(get_db)):
    _get_stage_or_404(stage_id, db)
    return db.execute(
        select(Automation).where(Automation.stage_id == stage_id)
    ).scalars().all()


@router.post("/{stage_id}/automations", response_model=AutomationRead, status_code=201)
def create_automation(
    stage_id: str, payload: AutomationCreate, db: Session = Depends(get_db)
):
    _get_stage_or_404(stage_id, db)
    automation = Automation(stage_id=stage_id, **payload.model_dump())
    db.add(automation)
    db.commit()
    db.refresh(automation)
    return automation


@router.patch("/{stage_id}/automations/{auto_id}", response_model=AutomationRead)
def update_automation(
    stage_id: str,
    auto_id: int,
    payload: AutomationUpdate,
    db: Session = Depends(get_db),
):
    auto = db.execute(
        select(Automation).where(
            Automation.id == auto_id, Automation.stage_id == stage_id
        )
    ).scalar_one_or_none()
    if not auto:
        raise HTTPException(status_code=404, detail="Automation not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(auto, field, value)
    db.commit()
    db.refresh(auto)
    return auto


@router.delete("/{stage_id}/automations/{auto_id}", status_code=204)
def delete_automation(
    stage_id: str, auto_id: int, db: Session = Depends(get_db)
):
    auto = db.execute(
        select(Automation).where(
            Automation.id == auto_id, Automation.stage_id == stage_id
        )
    ).scalar_one_or_none()
    if not auto:
        raise HTTPException(status_code=404, detail="Automation not found")
    db.delete(auto)
    db.commit()
