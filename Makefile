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

version: .clasp.json
	@awk '/"scriptId": "$(DEV_ID)"/ {print "current script: DEV"; exit} \
	     /"scriptId": "$(PROD_ID)"/ {print "current script: PROD"; exit}' .clasp.json

deps:
	sed -i '' -E 's/^(function|const|let|var)/export \1/' $(rootDir)/*.js
	sed -i '' 's|^// import |import |' $(rootDir)/*.js

prep:
	sed -i '' 's|^import |// import |' $(rootDir)/*.js
	sed -i '' 's/^export //' $(rootDir)/*.js

push: prep
	clasp push

install:
	pnpm install

init: install
	clasp create --rootDir=$(rootDir)

clone: install
	clasp clone --rootDir=$(rootDir) $(PROD_ID)

.PHONY: dev prod lint version deps prep push init clone

