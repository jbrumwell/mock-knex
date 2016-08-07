'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var tracker = require('../../../tracker');
var mockProperty = require('../../../../util/mock');

var connection = {
  id : 'mockedConnection',
};
var originalDriverName;

var clientMocks = {
  acquireConnection: function () {
    return connection;
  },

  releaseConnection: Promise.method(_.noop),

  acquireRawConnection: Promise.method(function() {
    return {};
  }),

  destroyRawConnection: function destroyRawConnection(connection, cb) {
    cb();
  },
  _query: function(connection, obj) {
    return new Promise(function(resolver, rejecter) {
      tracker.queries.track(obj, resolver);
    });
  },
  processResponse: function(obj) {
    obj = obj || {};

    if (obj.output) {
      obj.result = obj.output.call(this, obj.result);
    } else if (obj.method === 'first') {
      obj.result = Array.isArray(obj.result) ? obj.result[0] : obj.result;
    } else if (obj.method === 'pluck') {
      obj.result = _.pluck(obj.result, obj.pluck);
    }

    return obj.result;
  },
};

var runnerPrototypeMocks = {
  connection: {
    get: function () {
      return connection;
    },
    set: function (val) {}
  },
  ensureConnection: function() {
    return Promise.resolve(this.connection || {});
  },
};

function mockClient(client) {
  originalDriverName = client.driverName;
  client.driverName = 'mocked';
  Object.keys(clientMocks).map(function(key) {
    mockProperty(client, key, clientMocks[key]);
  });
}

function mockRunner(Runner) {
  Object.keys(runnerPrototypeMocks).map(function(key) {
    mockProperty(Runner.prototype, key, runnerPrototypeMocks[key]);
  });
}

function unmockClient(client) {
  client.driverName = originalDriverName;
  Object.keys(clientMocks).map(function(key) {
    client[key].restore();
  });
}

function unmockRunner(Runner) {
  Object.keys(runnerPrototypeMocks).map(function(key) {
    Runner.prototype[key].restore();
  });
}

module.exports = {
  mock: function(db) {
    mockClient(db.client);
    mockRunner(db.client.Runner);
  },
  unmock: function(db) {
    unmockClient(db.client);
    unmockRunner(db.client.Runner);
  }
};
