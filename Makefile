.PHONY: help up down build logs shell-backend shell-frontend lint migrate seed reset

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Docker ───────────────────────────────────────────────────────────────────

up: ## Start all services (dev mode)
	docker compose up --build

up-d: ## Start all services in detached mode
	docker compose up --build -d

down: ## Stop and remove containers
	docker compose down

build: ## Rebuild all images
	docker compose build --no-cache

logs: ## Follow logs from all services
	docker compose logs -f

logs-backend: ## Follow backend logs
	docker compose logs -f backend

logs-db: ## Follow database logs
	docker compose logs -f db

# ─── Shells ───────────────────────────────────────────────────────────────────

shell-backend: ## Open shell in backend container
	docker compose exec backend bash

shell-db: ## Open sqlcmd in database container
	docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$$(grep DB_PASSWORD .env | cut -d= -f2)" -No

# ─── Database ─────────────────────────────────────────────────────────────────

migrate: ## Run Alembic migrations
	docker compose run --rm backend alembic upgrade head

migrate-create: ## Create a new migration (usage: make migrate-create MSG="description")
	docker compose run --rm backend alembic revision --autogenerate -m "$(MSG)"

seed: ## Seed the database with sample data
	docker compose run --rm backend python -m app.seed

reset: ## Drop and recreate database, run migrations, seed data
	docker compose run --rm backend alembic downgrade base
	docker compose run --rm backend alembic upgrade head
	docker compose run --rm backend python -m app.seed

# ─── Linting ──────────────────────────────────────────────────────────────────

lint: lint-backend lint-frontend ## Run all linters

lint-backend: ## Run flake8 on backend
	docker compose run --rm backend flake8 app/

lint-frontend: ## Run ESLint on frontend
	docker compose run --rm frontend npm run lint

# ─── Production ───────────────────────────────────────────────────────────────

up-prod: ## Start in production mode
	FRONTEND_TARGET=production docker compose up --build -d
