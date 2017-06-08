ESLINT = node_modules/.bin/eslint
LAB = ./node_modules/lab/bin/lab
BABEL = ./node_modules/.bin/babel
KNEX_VERSIONS = 0.8 0.9 0.10 0.11 0.12 0.13

.PHONY: clean test lint lint-quiet watch build test-debug $(KNEX_VERSIONS)

default: build

clean:
	-rm -rf ./dist

test:
	${LAB} -v -I __BluebirdErrorTypes__,Set,Intl,Map,__core-js_shared__,System,Observable,regeneratorRuntime,asap,core,_babelPolyfill ./test/init.js

test-suite: $(KNEX_VERSIONS)

$(KNEX_VERSIONS):
	-npm i knex@$@
	make test

debug:
	BLUEBIRD_DEBUG=1 DEBUG=pool2 node-debug -p 8888 ${LAB} -m 0 -v -I __BluebirdErrorTypes__,Set,Intl,Map,__core-js_shared__,System,Observable,regeneratorRuntime,asap,core,_babelPolyfill ./test/init.js

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
