from abc import ABC, abstractmethod
from typing import Any

class MessagePublisher(ABC):
    """Abstract base class defining the interface for message publishing."""
    
    @abstractmethod
    def connect(self) -> None:
        """Establish connection to the message broker."""
        pass
    
    @abstractmethod
    def publish(self, topic: str, message: Any, qos: int = 0) -> None:
        """Publish a message to the specified topic."""
        pass
    
    @abstractmethod
    def disconnect(self) -> None:
        """Disconnect from the message broker."""
        pass