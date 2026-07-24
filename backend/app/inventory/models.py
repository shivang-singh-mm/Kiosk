from typing import List, Optional
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Tower(Base):
    __tablename__ = "tower"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    units: Mapped[List["Unit"]] = relationship("Unit", back_populates="tower", cascade="all, delete-orphan", lazy="joined")


class Unit(Base):
    __tablename__ = "unit"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    towerId: Mapped[int] = mapped_column(Integer, ForeignKey("tower.id"), nullable=False)
    number: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="AVAILABLE")  # AVAILABLE, BOOKED

    tower: Mapped[Optional["Tower"]] = relationship("Tower", back_populates="units")
