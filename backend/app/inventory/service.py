from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.inventory.repository import InventoryRepository
from app.inventory.schemas import InventoryRead, TowerRead, UnitRead


class InventoryService:
    def __init__(self, db: AsyncSession):
        self.repository = InventoryRepository(db)

    async def get_inventory(self) -> InventoryRead:
        towers = await self.repository.get_all_towers_with_units()
        
        tower_reads = []
        total = 0
        available = 0
        booked = 0

        for tower in towers:
            unit_reads = []
            for unit in tower.units:
                total += 1
                if unit.status == "BOOKED":
                    booked += 1
                else:
                    available += 1
                unit_reads.append(UnitRead.model_validate(unit))
            
            tower_reads.append(TowerRead(id=tower.id, name=tower.name, units=unit_reads))

        return InventoryRead(
            towers=tower_reads,
            totalUnits=total,
            availableUnits=available,
            bookedUnits=booked
        )
