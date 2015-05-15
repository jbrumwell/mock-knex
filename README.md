mock-knex
=========

A mock knex adapter for simulating a database during testing, exspecially usefull when used in combination
with [fixture-factory](http://github.com/colonyamerican/fixture-factory).

## Installation

```sh
$ npm install mock-knex --save-dev
```

## Mocking Knex

### Install

```js
var knex = require('knex');
var mockDB = require('mock-knex');
var db = knex({
    client: 'sqlite',
});

mockDb.mock(db, 'knex');
```

### Uninstall

```js
var mockDB = require('mock-knex');
var knex = require('knex');
var db = knex({
    client: 'sqlite',
});

mockDb.mock(db, 'knex');

... run tests ...

mockDb.unmock(db, 'knex');
```

## Tracker

The tracker allows you catch and respond to queries that occur during testing, see [Test](test/tracker.spec.js) for more
examples.

### Example Usage with knex

```js
var tracker = require('mock-knex').getTracker();

tracker.install();

tracker.on('query', function checkResult(query) {
  expect(query.method).to.equal('first');
  query.response([
    {
      fielda : 'A',
      fieldb : 'B'
    },
    {
      fielda : 'C',
      fieldb : 'D'
    },
    {
      fielda : 'E',
      fieldb : 'F'
    }
  ]);
});

knex.table('table').first('fielda', 'fieldb').then(function checkFirstArrResults(model) {
  expect(model.fielda).to.equal('A');
  expect(model.fieldb).to.equal('B');
  done();
});
```

### Example Usage with bookshelf.js

```js
var tracker = require('mock-knex').getTracker();

tracker.install();

tracker.on('query', function sendResult(query) {
  query.response([
    {
      id : 1,
      foo : 'bar'
    }
  ]);
});

Model.forge({ id : 1 }).fetch()
  .then(function fetchResult(model) {
    expect(model).to.be.an.instanceof(Model);
    expect(model.get('id')).to.equal(1);
    expect(model.get('foo')).to.equal('bar');
    done();
  });
```

## Running Tests

```sh
$ npm install
$ npm test
```
