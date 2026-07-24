from pydantic import BaseModel, ConfigDict


class GalleryRead(BaseModel):
    id: int
    title: str
    imageUrl: str

    model_config = ConfigDict(from_attributes=True)
