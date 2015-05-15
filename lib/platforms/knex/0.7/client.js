'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var tracker = require('../../../tracker');

module.exports = function (client) {
  var Runner = client.Runner;

  client.dialect = 'mocked';
  client.initDriver = client.initPool = client.initMigrator = _.noop;
  client.acquireConnection = Promise.method(function() {
    return {};
  });
  client.releaseConnection = Promise.method(_.noop);

  client.Runner.prototype.processResponse = function(obj) {
    obj = obj || {};
    
    if (obj.output) {
      obj.result = obj.output.call(this, obj.result);
    } else if (obj.method === 'first') {
      obj.result = Array.isArray(obj.result) ? obj.result[0] : obj.result;
    } else if (obj.method === 'pluck') {
      obj.result = _.pluck(obj.result, obj.pluck);
    }

    return obj.result;
  };

  client.Runner.prototype._query = Promise.method(function(obj) {
    if (this.isDebugging()) {
      this.debug(obj);
    }

    return new Promise(function(resolver, rejecter) {
      tracker.queries.track(obj, resolver);
    });
  });
};
