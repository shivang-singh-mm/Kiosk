from sqlalchemy.ext.asyncio import AsyncSession
from app.booking.repository import BookingRepository
from app.booking.schemas import BookingCreate, BookingRead
from app.websocket.manager import room_manager


class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = BookingRepository(db)

    async def book_unit(self, data: BookingCreate) -> BookingRead:
        booking = await self.repository.create_booking_atomic(
            unit_id=data.unitId,
            customer_name=data.customerName,
            phone=data.phone
        )
        
        # Broadcast real-time booking event to all paired session clients
        await room_manager.broadcast_unit_booked(
            session_id=data.sessionId,
            unit_id=data.unitId,
            customer_name=data.customerName
        )

        return BookingRead.model_validate(booking)
