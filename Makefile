PROD_ID:=
DEV_ID:=
rootDir:=

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
	biome lint --write *.js

version: .clasp.json
	@awk '/"scriptId": "$(DEV_ID)"/ {print "current script: DEV"; exit} \
	     /"scriptId": "$(PROD_ID)"/ {print "current script: PROD"; exit}' .clasp.json

deps:
	sed -i '' -E 's/^(function|const|let|var)/export \1/' src/*.js
	sed -i '' 's|^// import |import |' src/*.js

prep:
	sed -i '' 's|^import |// import |' src/*.js
	sed -i '' 's/^export //' src/*.js

push: prep
	clasp push

init:
	clasp create --rootDir=$(rootDir)

clone:
	clasp clone --rootDir=$(rootDir) $(PROD_ID)

.PHONY: dev prod lint version deps prep push init clone

