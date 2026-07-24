from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.booking.schemas import BookingCreate, BookingRead
from app.booking.service import BookingService

router = APIRouter(tags=["Booking"])


@router.post("/book", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def book_unit(payload: BookingCreate, db: AsyncSession = Depends(get_db)):
    service = BookingService(db)
    return await service.book_unit(payload)
