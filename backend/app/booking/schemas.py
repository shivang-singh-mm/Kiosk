import re
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict


class BookingCreate(BaseModel):
    unitId: int = Field(..., gt=0, description="ID of the unit to book")
    customerName: str = Field(..., min_length=2, max_length=100, description="Full customer name")
    phone: str = Field(..., min_length=7, max_length=20, description="Customer contact phone number")
    sessionId: str = Field(default="default", description="Active synchronization room ID")

    @field_validator("customerName")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Customer name must be at least 2 characters long")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        # Ensure phone contains digits and valid symbols
        digits_only = re.sub(r"[^\d]", "", v)
        if len(digits_only) < 7:
            raise ValueError("Phone number must contain at least 7 digits")
        return v


class BookingRead(BaseModel):
    id: int
    unitId: int
    customerName: str
    phone: str
    bookedAt: datetime

    model_config = ConfigDict(from_attributes=True)
