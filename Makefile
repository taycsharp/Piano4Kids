.PHONY: up down logs restart ps clean backend-shell frontend-shell

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f backend frontend

restart:
	docker compose restart backend frontend

ps:
	docker compose ps

clean:
	docker compose down -v --remove-orphans

backend-shell:
	docker compose exec backend sh

frontend-shell:
	docker compose exec frontend sh
