# web/backend/app/analytics/posthog_provider.py

import logging
from typing import Any
from app.analytics.provider import BaseAnalyticsProvider

logger = logging.getLogger(__name__)


class PostHogAnalyticsProvider(BaseAnalyticsProvider):
    """PostHog implementation of the analytics provider."""

    def __init__(self, api_key: str, host: str = "https://us.i.posthog.com") -> None:
        self._client = None
        self._initialized = False

        try:
            import posthog

            self._client = posthog.Posthog(
                project_api_key=api_key,
                host=host,
                disabled=False,
            )
            self._initialized = True
            logger.info("PostHog analytics provider initialized successfully.")
        except ImportError:
            logger.warning(
                "PostHog SDK ('posthog' package) is not installed. "
                "Analytics tracking will be disabled."
            )
        except Exception as e:
            logger.error("Failed to initialize PostHog analytics provider: %s", e)

    def track(
        self,
        distinct_id: str | int,
        event: str,
        properties: dict[str, Any] | None = None,
    ) -> None:
        if not self._initialized or not self._client:
            return

        try:
            # Ensure distinct_id is string
            distinct_id_str = str(distinct_id)
            self._client.capture(
                distinct_id=distinct_id_str,
                event=event,
                properties=properties or {},
            )
        except Exception as e:
            logger.error("Error capturing PostHog analytics event '%s': %s", event, e)

    def shutdown(self) -> None:
        if not self._initialized or not self._client:
            return

        try:
            self._client.flush()
            self._client.shutdown()
        except Exception as e:
            logger.error("Error shutting down PostHog client: %s", e)
