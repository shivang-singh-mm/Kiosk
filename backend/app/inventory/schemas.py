from pydantic import BaseModel, ConfigDict
from typing import List


class UnitRead(BaseModel):
    id: int
    towerId: int
    number: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class TowerRead(BaseModel):
    id: int
    name: str
    units: List[UnitRead] = []

    model_config = ConfigDict(from_attributes=True)


class InventoryRead(BaseModel):
    towers: List[TowerRead]
    totalUnits: int
    availableUnits: int
    bookedUnits: int
