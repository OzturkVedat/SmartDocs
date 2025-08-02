build:
	docker-compose up --build

seed:
	docker-compose exec backend npm run seed

down:
	docker-compose down -v --remove-orphans

reset:
	$(MAKE) down && $(MAKE) build

logs:
	docker-compose logs -f backend	

lint:
	npx eslint backend/

debug:
	node --inspect backend/server.js

run:
	cd frontend && npm run dev	
