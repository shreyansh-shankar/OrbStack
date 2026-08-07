# web/backend/app/analytics/__init__.py

from app.analytics.events import AnalyticsEvent
from app.analytics.service import AnalyticsService

analytics = AnalyticsService()

__all__ = ["analytics", "AnalyticsEvent", "AnalyticsService"]
