mock-knex
=========

A mock knex adapter for simulating a database during testing, especially useful when used in combination
with [fixture-factory](http://github.com/colonyamerican/fixture-factory).

## Knex Support

Currently supports knex 0.8 through 2.0

## Installation

```sh
$ npm install mock-knex --save-dev
```

## Usage

### for Mocking Knex

```js
var knex = require('knex');
var mockDb = require('mock-knex');
var db = knex({
    client: 'sqlite',
});

mockDb.mock(db);

... run tests ...
```

### for Unmocking

```js
... run tests ...

mockDb.unmock(db);
```

### for Tracking queries with knex

```js
... mock knex ...

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
  tracker.uninstall();
  done();
});
```

### for Tracking queries with Bookshelf

```js
... mock knex ...

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
    tracker.uninstall();
    done();
  });
```

### for Tracking multiple successive queries

```js
... mock knex ...
... enable tracking ...

tracker.on('query', function sendResult(query, step) {
  [
    function firstQuery() {
      expect(query.sql).to.equal(... some SQL string ...);
      query.response([{id: 1}]);
    },
    function secondQuery() {
      expect(query.sql).to.equal(... some SQL string ...);
      query.response([{id: 2}]);
    }
  ][step - 1]();
});
```

### More Examples?

Checkout the [Tests](./test/common/tracker.js)

## API

### require('mock-knex')

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>Arguments</th>
      <th>Returns</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>mock(knex)</b></td>
      <td rowspan="2">
        <dl>
          <dt>knex</dt>
          <dd><a href="http://knexjs.org/#Installation-client">initialized knex client</a></dd>
        </dl>
      </td>
      <td>-</td>
      <td>Attaches mocked client to knex instance</td>
    </tr>
    <tr>
      <td><b>unmock(knex)</b></td>
      <td>-</td>
      <td>Detaches mocked client from knex instance</td>
    </tr>
    <tr>
      <td><b>getTracker()</b></td>
      <td>-</td>
      <td><a href="#tracker">Tracker</a></td>
      <td>Returns query <a href="#tracker">Tracker</a> instance</td>
    </tr>
  </tbody>
</table>

### Tracker

The tracker enables you to catch and respond to queries that occur during testing, see [Test](./test/common/tracker.js) for more
examples.

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>Arguments</th>
      <th>Returns</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>install()</b></td>
      <td>-</td>
      <td>-</td>
      <td>Enables query tracking mock on mocked knex client</td>
    </tr>
    <tr>
      <td><a name="uninstall()"></a><b>uninstall()</b></td>
      <td>-</td>
      <td>-</td>
      <td>Disables query tracking mock on mocked knex client. Also resets 'step' counter.</td>
    </tr>
    <tr>
      <td nowrap="nowrap"><b>on('query', callback(query, step))</b></td>
      <td>
        <dl>
          <dt>callback</dt>
          <dd>
            <span>A function that gets executed on 'query' event.</span>
            <dl>
              <dt>query</dt>
              <dd><a href="#query-details">Query Details</a> object</dd>
              <dt>step</dt>
              <dd>Query execution call counter starting from 1. Increases after every 'query' event emitting. Gets resetted on calling <a href="#user-content-uninstall()">uninstall()</a>.</dd>
            </dl>
          </dd>
        </dl>
      </td>
      <td>-</td>
      <td>Add event listener for 'query' event. It gets executed for each query that should end up in database. Instead of this callback gets executed and its up to you to assert queries and mock database responses.</td>
    </tr>
  </tbody>
</table>

### Query Details

The object containing query details that is being sent to knex database dialect on query execution. Object properties signature matches with knex <a href="http://knexjs.org/#Other-toSQL">toSQL()</a> output with additional method returns(values).

<table>
  <thead>
    <tr>
      <th nowrap="nowrap">Property / Method</th>
      <th>Arguments</th>
      <th>Returns</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>bindings</b></td>
      <td></td>
      <td>Array</td>
      <td>SQL query parameters</td>
    </tr>
    <tr>
      <td><b>method</b></td>
      <td></td>
      <td>String</td>
      <td>Method name to be executed (e.g. 'select', 'update', 'delete', 'commit', 'rollback' adn etc.).</td>
    </tr>
    <tr>
      <td><b>sql</b></td>
      <td></td>
      <td>String</td>
      <td>Parameterized SQL query string to be executed. <a href="http://knexjs.org/#Raw-Bindings">Look</a></td>
    </tr>
    <tr>
      <td><b>options</b></td>
      <td></td>
      <td>Object</td>
      <td>Unknown purpose</td>
    </tr>
    <tr>
      <td><b>transacting</b></td>
      <td></td>
      <td>Boolean</td>
      <td>Whether or not the query was executed from within a transaction</td>
    </tr>
    <tr>
      <td><b>reject(Error)</b></td>
      <td>
        <dl>
          <dt>Error</dt>
          <dd>
            The Error, string or instance of Error, which represents why the result was rejected
          </dd>
        </dl>
      </td>
      <td>-</td>
      <td>
        Function that needs to be called to mock database query result for knex.
      </td>
    </tr>
    <tr>
      <td><b>response(values, options)</b></td>
      <td>
        <dl>
          <dt>values</dt>
          <dd>
            An array of mock data to be returned by database. For Bookshelf this is mostly array of objects. Knex could return any type of data.
          </dd>
        </dl>
        <dl>
          <dt>options</dt>
          <dd>
            <dl>
              <dt>stream</dt>
              <dd>
                Is this a stream response, defaults to false
              </dd>
            </dl>
          </dd>
        </dl>
      </td>
      <td>-</td>
      <td>
        Function that needs to be called to mock database query result for knex.
      </td>
    </tr>
  </tbody>
</table>

## Running Tests

```sh
$ npm install
$ docker-compose up -d
$ make test-suite
```
