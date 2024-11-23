from enum import Enum
from typing import List, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar('T')


class Page(BaseModel, Generic[T]):
    items: List[T]
    page_number: int
    page_size: int
    total_elements: int
    total_pages: int

    @classmethod
    def of(cls, items: List[T], page: int, size: int, total_elements: int) -> 'Page[T]':
        return cls(
            items=items,
            page_number=page,
            page_size=size,
            total_elements=total_elements,
            total_pages=int((total_elements + size - 1) / size)
        )


class SensorType(Enum):
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    NOISE = "noise"
    AIR_QUALITY = "air-quality"