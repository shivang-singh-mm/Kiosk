from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Booking(Base):
    __tablename__ = "booking"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    unitId: Mapped[int] = mapped_column(Integer, ForeignKey("unit.id"), nullable=False)
    customerName: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    bookedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
