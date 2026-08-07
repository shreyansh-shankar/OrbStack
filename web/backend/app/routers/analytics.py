# web/backend/app/routers/analytics.py

import logging
from typing import Any
from fastapi import APIRouter, status
from pydantic import BaseModel
from app.analytics import analytics

router = APIRouter()
logger = logging.getLogger(__name__)


class AnalyticsTrackRequest(BaseModel):
    event: str
    properties: dict[str, Any] | None = None


@router.post("/analytics/track", status_code=status.HTTP_200_OK)
async def track_anonymous_event(body: AnalyticsTrackRequest):
    """
    Public proxy endpoint for frontend and landing page anonymous analytics.
    Enforces 100% anonymous tracking — strips IPs, headers, and user tokens.
    """
    try:
        analytics.track("anonymous", body.event, body.properties)
    except Exception as e:
        logger.error("Error in anonymous analytics proxy route: %s", e)

    return {"status": "ok"}
