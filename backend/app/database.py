from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


def _ensure_database_exists(url: str) -> None:
    """Create the database if it does not exist (MSSQL-safe)."""
    # Connect to master to create the target DB
    master_url = url.replace(
        "/" + url.split("/")[-1].split("?")[0],
        "/master?" + url.split("?")[1] if "?" in url else "/master",
    )
    db_name = url.split("/")[-1].split("?")[0]

    engine_master = create_engine(master_url, isolation_level="AUTOCOMMIT")
    with engine_master.connect() as conn:
        exists = conn.execute(
            text("SELECT COUNT(*) FROM sys.databases WHERE name = :name"),
            {"name": db_name},
        ).scalar()
        if not exists:
            conn.execute(text(f"CREATE DATABASE [{db_name}]"))
    engine_master.dispose()


_ensure_database_exists(settings.database_url)

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=(settings.app_env == "development"),
)


@event.listens_for(engine, "connect")
def set_mssql_options(dbapi_connection, connection_record):
    """Set MSSQL-specific options on new connections."""
    pass


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
