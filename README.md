mock-knex
=========

A mock knex adapter for simulating a database during testing

## Installation

    $ npm install mock-knex --save-dev

## Mocking Knex

### Install

```
var knex = require('knex');
var mockDB = require('mock-knex');

mockDB.knex.use(knex); // tell it the knex package to use

mockDB.knex.install(); // mock all knex adapters
mockDB.knex.install('sqlite3'); // mock knex sqlite3 adapters
mockDB.knex.install(['sqlite3', 'mysql', 'websql']); // mock multiple adapters
```

### Uninstall

```
var mockDB = require('mock-knex');

mockDB.knex.install(); // mock all knex adapters

... run tests ...

mockDB.knex.uninstall(); // reverts mocked adapters
```

## Tracker

The tracker allows you catch and respond to queries that occur during testing, see [Test](test/tracker.spec.js) for more
examples.

### Example Usage with knex

```
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

```
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

```
$ npm install
$ npm test
```
