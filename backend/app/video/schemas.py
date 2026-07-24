from pydantic import BaseModel, ConfigDict


class VideoRead(BaseModel):
    id: int
    title: str
    thumbnail: str
    videoUrl: str

    model_config = ConfigDict(from_attributes=True)
