PROD_ID:=
DEV_ID:=
rootDir:=./src

help: version
	@echo "dev: use staging apps script file"
	@echo "prod: use production apps script file"

dev:
	cp .clasp.json .clasp-old.json
	sed -i '' 's/$(PROD_ID)/$(DEV_ID)/' .clasp.json

prod:
	cp .clasp.json .clasp-old.json
	sed -i '' 's/$(DEV_ID)/$(PROD_ID)/' .clasp.json

lint:
	biome lint --write $(rootDir)/*.js

fmt:
	biome format --write $(rootDir)/*.js

version: .clasp.json
	@awk '/"scriptId": "$(DEV_ID)"/ {print "current script: DEV"; exit} \
	     /"scriptId": "$(PROD_ID)"/ {print "current script: PROD"; exit}' .clasp.json

deps: fmt
	./blkuc.pl $(rootDir)/*.js

prep: fmt
	./blkc.pl $(rootDir)/*.js

clasp-pull: version
	clasp pull

pull: clasp-pull
	$(MAKE) deps

clasp-push: prep version
	clasp push

push: clasp-push
	$(MAKE) deps

test:
	pnpm test

install:
	pnpm install

init: install
	clasp create --rootDir=$(rootDir)

clone: install
	clasp clone --rootDir=$(rootDir) $(PROD_ID)

.PHONY: dev prod lint version deps prep push init clone fmt pull clasp-push clasp-pull test
