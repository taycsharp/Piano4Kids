from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://piano:piano@db:5432/piano_academy"
    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_model: str = "qwen2.5:3b-instruct"
    ollama_timeout_seconds: float = 300
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
    jwt_secret: str = "dev-change-this-secret-for-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
