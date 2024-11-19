from abc import ABC, abstractmethod
from typing import Any


class TaskHandler(ABC):
    """Interface for task handlers."""

    @abstractmethod
    def execute(self, *args: Any, **kwargs: Any) -> None:
        """Execute the task logic."""
        pass

    @abstractmethod
    def handle_error(self, error: Exception) -> None:
        """Handle any errors that occur during task execution."""
        pass
