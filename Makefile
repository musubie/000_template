PROD_ID:=
DEV_ID:=

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
	@awk '$$2 ~ /$(DEV_ID)/ {print "current script: DEV"}' .clasp.json
	@awk '$$2 ~ /${PROD_ID)}/ {print "current script: PROD"}' .clasp.json

deps:
	sed -i '' -E 's/^(function|const|let|var)/export \1/' *.js
	sed -i '' 's|^// import |import |' *.js

prep:
	sed -i '' 's|^import |// import |' *.js
	sed -i '' 's/^export //' *.js

push: prep
	clasp push
