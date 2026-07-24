from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.video.models import Video


class VideoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Video]:
        result = await self.db.execute(select(Video).order_by(Video.id))
        return list(result.scalars().all())
