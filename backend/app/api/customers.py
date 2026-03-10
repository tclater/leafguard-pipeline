from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer
from app.schemas import CustomerRead, CustomerCreate, CustomerUpdate, CustomerList

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=CustomerList)
def list_customers(
    stage: str | None = Query(None, description="Filter by stage ID"),
    rep: str | None = Query(None, description="Filter by rep name"),
    stagnant_only: bool = Query(False, description="Only show stagnant deals (>24h)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = select(Customer)

    if stage:
        query = query.where(Customer.stage_id == stage)
    if rep:
        query = query.where(Customer.rep == rep)
    if stagnant_only:
        query = query.where(Customer.hours_in_stage > 24)

    total = db.execute(
        select(func.count()).select_from(query.subquery())
    ).scalar_one()

    items = db.execute(
        query.offset((page - 1) * page_size).limit(page_size)
    ).scalars().all()

    return CustomerList(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, -(-total // page_size)),
    )


@router.post("", response_model=CustomerRead, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.patch("/{customer_id}", response_model=CustomerRead)
def update_customer(
    customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)
):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()
