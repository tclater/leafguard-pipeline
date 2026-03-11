import urllib.parse

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


def _build_odbc_url(database: str) -> str:
    """
    Build a SQLAlchemy URL using odbc_connect= so every ODBC attribute
    is passed verbatim — avoids SQLAlchemy mis-parsing TrustServerCertificate.
    """
    odbc_str = (
        f"Driver={{ODBC Driver 18 for SQL Server}};"
        f"Server={settings.db_host},{settings.db_port};"
        f"Database={database};"
        f"UID={settings.db_user};"
        f"PWD={settings.db_password};"
        f"TrustServerCertificate=yes;"
        f"Encrypt=yes;"
    )
    return "mssql+pyodbc:///?odbc_connect=" + urllib.parse.quote_plus(odbc_str)


def _ensure_database_exists() -> None:
    """Create the target database in master if it does not already exist."""
    master_engine = create_engine(
        _build_odbc_url("master"),
        isolation_level="AUTOCOMMIT",
        pool_pre_ping=True,
    )
    with master_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT COUNT(*) FROM sys.databases WHERE name = :name"),
            {"name": settings.db_name},
        ).scalar()
        if not exists:
            conn.execute(text(f"CREATE DATABASE [{settings.db_name}]"))
    master_engine.dispose()


_ensure_database_exists()

engine = create_engine(
    _build_odbc_url(settings.db_name),
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=(settings.app_env == "development"),
)

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
