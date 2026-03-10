from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    company: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    stage_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("stages.id"), nullable=False
    )
    rep: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    last_contact: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    hours_in_stage: Mapped[int] = mapped_column(Integer, default=0)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")

    stage: Mapped["Stage"] = relationship("Stage", back_populates="customers")  # noqa: F821
