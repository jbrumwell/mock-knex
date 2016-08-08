'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var tracker = require('../../../tracker');
var mock = require('../../../../util/mock');
var originalDriverName;

var connection = {
  id : 'mockedConnection',
};

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
};

var clientPrototypeMocks = {
  _query: function (connection, obj) {
    return new Promise(function (resolver, rejecter) {
      tracker.queries.track(obj, resolver);
    });
  },

  processResponse: function (obj) {
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

function mockClient(client) {
  originalDriverName = client.driverName;
  client.driverName = 'mocked';

  Object.keys(clientMocks).map(function(key) {
    mock.mockProperty(client, key, clientMocks[key]);
  });

  Object.keys(clientPrototypeMocks).map(function(key) {
    mock.mockPrototype(client, key, clientPrototypeMocks[key]);
  });
}

function unmockClient(client) {
  client.driverName = originalDriverName;

  Object.keys(clientMocks)
    .concat(Object.keys(clientPrototypeMocks))
    .map(function(key) {
      client[key].restore();
    });
}

function mockRunner(Runner) {
  var mockedRunner = Runner.prototype;

  var newRunner = {};

  Object.getOwnPropertyNames(mockedRunner).map(function(key) {
    if(['ensureConnection', 'connection'].indexOf(key) === -1) {
      newRunner[key] = mockedRunner[key];
    }
  });

  newRunner.ensureConnection = function() {
    return Promise.resolve(this.connection || {});
  };

  Object.defineProperty(newRunner, "connection", {
    get : function () {
      return connection;
    },
    set : function () {}
  });

  newRunner.restore = function() {
    Runner.prototype = mockedRunner;
  }

  Runner.prototype = newRunner;
}

module.exports = {
  mock: function(db) {
    mockClient(db.client);
    mockRunner(db.client.Runner);
  },
  unmock: function(db) {
    unmockClient(db.client);
    db.client.Runner.prototype.restore();
  },
};


