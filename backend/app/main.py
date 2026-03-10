from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.api import customers, stages, metrics

# Create all tables on startup (Alembic handles this in production;
# this is a safety net for fresh dev environments)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LeafGuard Sales Pipeline API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stages.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(metrics.router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok", "env": settings.app_env}
