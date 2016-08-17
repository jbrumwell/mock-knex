ESLINT = node_modules/.bin/eslint
LAB = ./node_modules/lab/bin/lab
BABEL = ./node_modules/.bin/babel

.PHONY: clean test lint lint-quiet watch build test-debug

default: build

clean:
	-rm -rf ./dist

test:
	${LAB} -v -I __BluebirdErrorTypes__,Set,Intl,Map,__core-js_shared__

test-suite:
	npm i knex@0.8
	make test
	npm i knex@0.9
	make test
	npm i knex@0.10
	make test
	npm i knex@0.11
	make test

test-debug:
	BLUEBIRD_DEBUG=1 DEBUG=pool2 node-debug -p 8888 ${LAB} -m 0 -v -I __BluebirdErrorTypes__,Set,Intl,Map,__core-js_shared__

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
