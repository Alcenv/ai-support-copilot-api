.PHONY: help network up up-api up-n8n down down-api down-n8n logs logs-api logs-n8n restart restart-api restart-n8n build build-api build-n8n

API_COMPOSE=python-api/docker-compose.yml
N8N_COMPOSE=infra/docker-compose.n8n.yml
NETWORK=shared_network

help:
	@echo "AI Support Copilot - Dev Commands"
	@echo ""
	@echo "  make network        Create shared docker network (once)"
	@echo "  make up             Start full stack (API + n8n + mailhog)"
	@echo "  make down           Stop full stack"
	@echo "  make build          Build API image (n8n/mailhog are pulled)"
	@echo "  make logs           Follow logs for full stack"
	@echo ""
	@echo "  make up-api         Start only API"
	@echo "  make up-n8n         Start only n8n + mailhog"
	@echo "  make down-api       Stop only API"
	@echo "  make down-n8n       Stop only n8n + mailhog"
	@echo "  make logs-api       Follow API logs"
	@echo "  make logs-n8n       Follow n8n logs"
	@echo ""

network:
	@docker network inspect $(NETWORK) >/dev/null 2>&1 || docker network create $(NETWORK)

build: network
	docker compose -f $(API_COMPOSE) build

build-api: build

build-n8n: network
	docker compose -f $(N8N_COMPOSE) pull

up: network
	docker compose -f $(API_COMPOSE) up -d --build
	docker compose -f $(N8N_COMPOSE) up -d

up-api: network
	docker compose -f $(API_COMPOSE) up -d --build

up-n8n: network
	docker compose -f $(N8N_COMPOSE) up -d

down:
	docker compose -f $(API_COMPOSE) down
	docker compose -f $(N8N_COMPOSE) down

down-api:
	docker compose -f $(API_COMPOSE) down

down-n8n:
	docker compose -f $(N8N_COMPOSE) down

restart: network
	$(MAKE) down
	$(MAKE) up

restart-api: network
	docker compose -f $(API_COMPOSE) down
	docker compose -f $(API_COMPOSE) up -d --build

restart-n8n: network
	docker compose -f $(N8N_COMPOSE) down
	docker compose -f $(N8N_COMPOSE) up -d

logs:
	@echo "== API logs =="
	@docker logs -f ai-support-copilot-api & \
	echo "== n8n logs ==" && docker logs -f n8n

logs-api:
	docker logs -f ai-support-copilot-api

logs-n8n:
	docker logs -f n8n
