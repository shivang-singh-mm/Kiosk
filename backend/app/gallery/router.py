from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.gallery.schemas import GalleryRead
from app.gallery.service import GalleryService

router = APIRouter(prefix="/gallery", tags=["Gallery"])


@router.get("", response_model=List[GalleryRead])
async def get_gallery(db: AsyncSession = Depends(get_db)):
    service = GalleryService(db)
    return await service.get_all_images()
