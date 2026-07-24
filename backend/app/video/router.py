from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.video.schemas import VideoRead
from app.video.service import VideoService

router = APIRouter(prefix="/videos", tags=["Videos"])


@router.get("", response_model=List[VideoRead])
async def get_videos(db: AsyncSession = Depends(get_db)):
    service = VideoService(db)
    return await service.get_all_videos()
