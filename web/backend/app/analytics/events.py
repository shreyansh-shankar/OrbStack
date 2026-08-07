# web/backend/app/analytics/events.py

from enum import Enum


class AnalyticsEvent(str, Enum):
    USER_REGISTERED = "user.registered"
    USER_VERIFIED = "user.verified"
    CLI_LOGIN = "cli.login"
    MODULE_STARTED = "module.started"
    MODULE_COMPLETED = "module.completed"
    SECTION_COMPLETED = "section.completed"
    LAB_STARTED = "lab.started"
    LAB_COMPLETED = "lab.completed"
