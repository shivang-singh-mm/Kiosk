from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import HTTPException, status
from app.booking.models import Booking
from app.inventory.models import Unit


class BookingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_booking_atomic(self, unit_id: int, customer_name: str, phone: str) -> Booking:
        """
        Executes an atomic race-condition safe unit booking.
        Uses conditional UPDATE query within a transaction.
        If two concurrent requests attempt to book the same unit simultaneously,
        only one UPDATE will match status='AVAILABLE' and rowcount==1.
        The second request will get rowcount==0 and fail with 409 Conflict.
        """
        # Step 1: Check unit existence
        result = await self.db.execute(select(Unit).where(Unit.id == unit_id))
        unit = result.scalar_one_or_none()

        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unit with ID {unit_id} not found."
            )

        if unit.status == "BOOKED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This unit has already been booked."
            )

        # Step 2: Atomic conditional status transition (AVAILABLE -> BOOKED)
        stmt = (
            update(Unit)
            .where(Unit.id == unit_id, Unit.status == "AVAILABLE")
            .values(status="BOOKED")
        )
        res = await self.db.execute(stmt)

        # Check if the row was successfully transitioned
        if res.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This unit has already been booked."
            )

        # Step 3: Record booking log
        booking = Booking(
            unitId=unit_id,
            customerName=customer_name,
            phone=phone,
            bookedAt=datetime.utcnow()
        )
        self.db.add(booking)
        await self.db.commit()
        await self.db.refresh(booking)

        return booking
