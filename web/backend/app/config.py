# web/backend/app/config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    ENVIRONMENT: str = "development"

    # Email Settings
    RESEND_API_KEY: str | None = None
    MAIL_FROM: str = "DevLab <onboarding@resend.dev>"
    FRONTEND_URL: str = "http://localhost:3000"

    # GitHub OAuth Settings
    GITHUB_CLIENT_ID: str | None = None
    GITHUB_CLIENT_SECRET: str | None = None

    # GitHub Commit Integration Settings
    GITHUB_TOKEN: str | None = None
    CHALLENGES_REPO: str = "thelastdeploy/thelastdeploy"
    CHALLENGES_BRANCH: str = "main"

    # Analytics / PostHog Settings
    POSTHOG_API_KEY: str | None = None
    POSTHOG_HOST: str = "https://us.i.posthog.com"
    ANALYTICS_ENABLED: bool = False

    class Config:
        env_file = ".env"

settings = Settings()