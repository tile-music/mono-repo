docker compose -f docker-compose-prod.yaml build --no-cache && docker compose -f docker-compose-prod.yaml down -v && docker compose -f docker-compose-prod.yaml up -d
