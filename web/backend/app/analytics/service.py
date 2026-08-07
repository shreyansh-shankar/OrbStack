# web/backend/app/analytics/service.py

import logging
from typing import Any
from app.analytics.events import AnalyticsEvent
from app.analytics.posthog_provider import PostHogAnalyticsProvider
from app.analytics.provider import BaseAnalyticsProvider, NoOpAnalyticsProvider
from app.config import settings

logger = logging.getLogger(__name__)

# List of forbidden property keys to protect user privacy
DISALLOWED_PROPERTY_KEYS = {
    "password",
    "password_hash",
    "token",
    "reset_token",
    "verification_token",
    "device_key",
    "validator_script",
    "validator_output",
    "validator_hash",
    "output",
    "command",
    "shell_history",
    "logs",
    "user_id",
    "email",
    "username",
    "ip",
    "user",
}


class AnalyticsService:
    """Central analytics service managing providers and privacy guarantees."""

    def __init__(self) -> None:
        self._provider: BaseAnalyticsProvider = NoOpAnalyticsProvider()
        self._initialize_provider()

    def _initialize_provider(self) -> None:
        try:
            if settings.ANALYTICS_ENABLED and settings.POSTHOG_API_KEY:
                self._provider = PostHogAnalyticsProvider(
                    api_key=settings.POSTHOG_API_KEY,
                    host=settings.POSTHOG_HOST,
                )
            else:
                self._provider = NoOpAnalyticsProvider()
        except Exception as e:
            logger.error("Failed to initialize analytics provider, falling back to NoOp: %s", e)
            self._provider = NoOpAnalyticsProvider()

    def _sanitize_properties(self, properties: dict[str, Any] | None) -> dict[str, Any]:
        if not properties:
            return {}
        return {
            k: v
            for k, v in properties.items()
            if k.lower() not in DISALLOWED_PROPERTY_KEYS
        }

    def track(
        self,
        distinct_id: str | int = "anonymous",
        event: AnalyticsEvent | str = "",
        properties: dict[str, Any] | None = None,
    ) -> None:
        """
        Track an analytics event safely and anonymously.
        Enforces 100% anonymous tracking — never forwards user IDs or PII.
        Never raises exceptions to caller code.
        """
        try:
            # Enforce 100% anonymous distinct_id for all backend events
            anonymous_distinct_id = "anonymous"
            event_name = event.value if isinstance(event, AnalyticsEvent) else str(event)
            clean_properties = self._sanitize_properties(properties)
            self._provider.track(
                distinct_id=anonymous_distinct_id,
                event=event_name,
                properties=clean_properties,
            )
        except Exception as e:
            logger.error("Unexpected error in AnalyticsService.track: %s", e)

    def shutdown(self) -> None:
        try:
            self._provider.shutdown()
        except Exception as e:
            logger.error("Unexpected error during AnalyticsService shutdown: %s", e)
