from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Stage(Base):
    __tablename__ = "stages"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(50), nullable=False, default="bg-blue-500")
    velocity: Mapped[float] = mapped_column(Float, default=0.0)
    conversion_rate: Mapped[float] = mapped_column(Float, default=0.0)
    avg_time_in_stage: Mapped[float] = mapped_column(Float, default=0.0)
    stagnant: Mapped[int] = mapped_column(Integer, default=0)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    automations: Mapped[list["Automation"]] = relationship(  # noqa: F821
        "Automation",
        back_populates="stage",
        cascade="all, delete-orphan",
        order_by="Automation.id",
    )
    customers: Mapped[list["Customer"]] = relationship(  # noqa: F821
        "Customer",
        back_populates="stage",
    )

    @property
    def count(self) -> int:
        return len(self.customers)
