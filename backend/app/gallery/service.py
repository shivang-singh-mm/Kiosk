from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.gallery.repository import GalleryRepository
from app.gallery.models import Gallery


class GalleryService:
    def __init__(self, db: AsyncSession):
        self.repository = GalleryRepository(db)

    async def get_all_images(self) -> List[Gallery]:
        return await self.repository.get_all()
