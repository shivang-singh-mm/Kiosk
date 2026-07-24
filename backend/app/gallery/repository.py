from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.gallery.models import Gallery


class GalleryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Gallery]:
        result = await self.db.execute(select(Gallery).order_by(Gallery.id))
        return list(result.scalars().all())
