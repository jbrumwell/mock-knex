'use strict';

var tracker = require('../tracker');

module.exports = function(client) {
  var _ = require('lodash');
  var Promise = require('knex/lib/promise');

  require('knex/lib/dialects/sqlite3/runner')(client);

  var SQLite3 = client.Runner;
  var inherits = require('util').inherits;

  function Mocked() {
    SQLite3.apply(this, arguments);
  }

  inherits(Mocked, SQLite3);

  Mocked.prototype._query = Promise.method(function(obj) {
    if (this.isDebugging()) {
      this.debug(obj);
    }

    return new Promise(function(resolver, rejecter) {
      tracker.queries.track(obj, resolver);
    });
  });

  Mocked.prototype._beginTransaction    = null;
  Mocked.prototype._commitTransaction   = null;
  Mocked.prototype._rollbackTransaction = null;

  Mocked.prototype.processResponse = function(obj) {
    if (obj.output) {
      obj.result = obj.output.call(this, obj.result);
    } else if (obj.method === 'first') {
      obj.result = Array.isArray(obj.result) ? obj.result[0] : obj.result;
    } else if (obj.method === 'pluck') {
      obj.result = _.pluck(obj.result, obj.pluck);
    }

    return obj.result;
  };

  client.Runner = Mocked;
};
