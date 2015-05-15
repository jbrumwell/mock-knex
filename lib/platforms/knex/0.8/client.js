'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var tracker = require('../../../tracker');

function mockClient(client) {
  client.driverName = 'mocked';

  client.acquireRawConnection = Promise.method(function() {
    return {};
  });

  client.destroyRawConnection = function destroyRawConnection(connection, cb) {
    cb();
  };

  client.constructor.prototype._query = client._query = function(connection, obj) {
    return new Promise(function(resolver, rejecter) {
      tracker.queries.track(obj, resolver);
    });
  };

  client.constructor.prototype.processResponse = client.processResponse = function(obj) {
    if (obj.output) {
      obj.result = obj.output.call(this, obj.result);
    } else if (obj.method === 'first') {
      obj.result = Array.isArray(obj.result) ? obj.result[0] : obj.result;
    } else if (obj.method === 'pluck') {
      obj.result = _.pluck(obj.result, obj.pluck);
    }

    return obj.result;
  };
}

function mockRunner(Runner) {
  Runner.prototype.ensureConnection = function() {
    return Promise.resolve({});
  };

  Runner.prototype.connection = {};
}

module.exports = function (db) {
  mockClient(db.client);
  mockRunner(db.client.Runner);
};
