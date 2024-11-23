from typing import Generic, TypeVar, List
from pydantic import BaseModel


T = TypeVar('T')

class Page(BaseModel, Generic[T]):
    items: List[T]
    page_number: int
    page_size: int
    total_elements: int
    total_pages: int

    @classmethod
    def empty(cls):
        return cls(
            items=[],
            page_number=0,
            page_size=0,
            total_elements=0,
            total_pages=0
        )

    class Config:
        # Permitir el uso de alias en la deserialización
        populate_by_name = True
        # Permitir nombres de campos diferentes entre JSON y modelo
        alias_generator = None
        # Permitir campos extra en el JSON
        extra = 'allow'