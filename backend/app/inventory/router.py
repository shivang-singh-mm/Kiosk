from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.inventory.schemas import InventoryRead
from app.inventory.service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=InventoryRead)
async def get_inventory(db: AsyncSession = Depends(get_db)):
    service = InventoryService(db)
    return await service.get_inventory()
