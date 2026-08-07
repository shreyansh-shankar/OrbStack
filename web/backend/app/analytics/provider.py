# web/backend/app/analytics/provider.py

from abc import ABC, abstractmethod
from typing import Any


class BaseAnalyticsProvider(ABC):
    """Abstract base class for analytics providers."""

    @abstractmethod
    def track(
        self,
        distinct_id: str | int,
        event: str,
        properties: dict[str, Any] | None = None,
    ) -> None:
        """Track an event for a user or distinct identifier."""
        pass

    @abstractmethod
    def shutdown(self) -> None:
        """Flush and clean up provider resources."""
        pass


class NoOpAnalyticsProvider(BaseAnalyticsProvider):
    """No-op provider used when analytics are disabled or misconfigured."""

    def track(
        self,
        distinct_id: str | int,
        event: str,
        properties: dict[str, Any] | None = None,
    ) -> None:
        pass

    def shutdown(self) -> None:
        pass
