build:
	docker-compose up --build

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
	npx nodemon backend/server.js