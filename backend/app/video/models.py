from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Video(Base):
    __tablename__ = "video"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    thumbnail: Mapped[str] = mapped_column(String(500), nullable=False)
    videoUrl: Mapped[str] = mapped_column(String(500), nullable=False)
