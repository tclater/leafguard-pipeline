from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Individual DB params — used to build the odbc_connect string reliably
    db_host: str = "db"
    db_port: int = 1433
    db_name: str = "leafguard"
    db_user: str = "sa"
    db_password: str

    app_env: str = "development"
    secret_key: str = "dev-secret-key"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
