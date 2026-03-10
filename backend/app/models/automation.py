from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Automation(Base):
    __tablename__ = "automations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    stage_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("stages.id", ondelete="CASCADE"), nullable=False
    )
    icon: Mapped[str] = mapped_column(String(50), nullable=False, default="Mail")
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    trigger: Mapped[str] = mapped_column(String(100), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False, default="")

    stage: Mapped["Stage"] = relationship("Stage", back_populates="automations")  # noqa: F821
