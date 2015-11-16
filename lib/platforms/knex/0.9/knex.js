'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var tracker = require('../../../tracker');

module.exports = function (client) {
  var Runner = client.Runner;

  client.driverName = 'mocked';
  client.initDriver = client.initPool = client.initMigrator = _.noop;

  client.acquireRawConnection = Promise.method(function() {
    return {};
  });

  client.destroyRawConnection = function destroyRawConnection(connection, cb) {
    cb();
  };

  client._query = function(connection, obj) {
    return new Promise(function(resolver, rejecter) {
      tracker.queries.track(obj, resolver);
    });
  };

  client.processResponse = function(obj) {
    if (obj.output) {
      obj.result = obj.output.call(this, obj.result);
    } else if (obj.method === 'first') {
      obj.result = Array.isArray(obj.result) ? obj.result[0] : obj.result;
    } else if (obj.method === 'pluck') {
      obj.result = _.pluck(obj.result, obj.pluck);
    }

    return obj.result;
  };
};
