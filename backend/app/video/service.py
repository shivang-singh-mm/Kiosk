from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.video.repository import VideoRepository
from app.video.models import Video


class VideoService:
    def __init__(self, db: AsyncSession):
        self.repository = VideoRepository(db)

    async def get_all_videos(self) -> List[Video]:
        return await self.repository.get_all()
