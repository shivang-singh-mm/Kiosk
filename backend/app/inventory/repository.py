from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.inventory.models import Tower, Unit


class InventoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_towers_with_units(self) -> List[Tower]:
        result = await self.db.execute(
            select(Tower).order_by(Tower.id)
        )
        return list(result.unique().scalars().all())

    async def get_unit_by_id(self, unit_id: int) -> Unit | None:
        result = await self.db.execute(
            select(Unit).where(Unit.id == unit_id)
        )
        return result.scalar_one_or_none()
