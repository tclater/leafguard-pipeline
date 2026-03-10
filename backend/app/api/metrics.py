from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer
from app.schemas import MetricsRead

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("", response_model=MetricsRead)
def get_metrics(db: Session = Depends(get_db)):
    total_value = db.execute(
        select(func.sum(Customer.value))
    ).scalar_one_or_none() or 0.0

    total_deals = db.execute(
        select(func.count(Customer.id))
    ).scalar_one()

    stagnant_deals = db.execute(
        select(func.count(Customer.id)).where(Customer.hours_in_stage > 24)
    ).scalar_one()

    closed_count = db.execute(
        select(func.count(Customer.id)).where(Customer.stage_id == "closed")
    ).scalar_one()

    avg_deal_size = (total_value / total_deals) if total_deals > 0 else 0.0
    conversion_rate = (closed_count / total_deals * 100) if total_deals > 0 else 0.0

    return MetricsRead(
        total_pipeline=round(total_value, 2),
        avg_deal_size=round(avg_deal_size, 2),
        total_deals=total_deals,
        stagnant_deals=stagnant_deals,
        conversion_rate=round(conversion_rate, 1),
        closed_count=closed_count,
    )
