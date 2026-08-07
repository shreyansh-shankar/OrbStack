# web/backend/main.py

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.analytics import analytics
from app.routers import auth, modules, results, users, builder, analytics as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    analytics.shutdown()


# Only enable docs in development environment
docs_url = "/docs" if settings.ENVIRONMENT == "development" else None
redoc_url = "/redoc" if settings.ENVIRONMENT == "development" else None
openapi_url = "/openapi.json" if settings.ENVIRONMENT == "development" else None

app = FastAPI(
    title="The Last Deploy API",
    description="Backend for The Last Deploy DevOps practice platform (with privacy-first analytics)",
    version="0.3.1",
    docs_url=docs_url,
    redoc_url=redoc_url,
    openapi_url=openapi_url,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["auth"])
app.include_router(modules.router, tags=["modules"])   # includes /labs/:id too
app.include_router(results.router, tags=["results"])
app.include_router(users.router, tags=["users"])
app.include_router(builder.router, tags=["builder"])
app.include_router(analytics_router.router, tags=["analytics"])


@app.get("/health")
async def health():
    return {"status": "ok"}