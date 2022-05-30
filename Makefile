ESLINT = node_modules/.bin/eslint
LAB = ./node_modules/lab/bin/lab
BABEL = ./node_modules/.bin/babel
KNEX_VERSIONS = 0.8 0.9 0.10 0.11 0.12 0.13 0.14 0.15 0.16 0.17 0.18 0.19 0.20 0.21 0.95 1.0 2.0

.PHONY: clean test lint lint-quiet watch build test-debug $(KNEX_VERSIONS)

default: build

clean:
	-rm -rf ./dist

test:
	${LAB} ./test/init.js

test-suite: $(KNEX_VERSIONS)

$(KNEX_VERSIONS):
	-npm i knex@$@
	make test

debug:
	BLUEBIRD_DEBUG=1 DEBUG=pool2 node --inspect-brk ${LAB} ./test/init.js

lint:
	$(ESLINT) --ext .js --ext .jsx .

lint-quiet:
	$(ESLINT) --ext .js --ext .jsx --quiet .

watch:
	make clean
	${BABEL} src --out-dir=dist --watch

build:
	make clean
	${BABEL} src --out-dir=dist
