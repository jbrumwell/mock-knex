'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spec = undefined;
exports.defineConnection = defineConnection;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _tracker = require('../../../tracker');

var _tracker2 = _interopRequireDefault(_tracker);

var _index = require('../0.7/index');

var _transformer = require('../../../util/transformer');

var _transformer2 = _interopRequireDefault(_transformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connection = {
  id: 'mockedConnection'
};

var processResponse = _lodash2.default.get(_index.spec, 'replace[0].client.Runner.prototype.processResponse');
var _query = function _query(con, obj) {
  obj.context = this;

  obj.transacting = !!this.transacting;

  return new _bluebird2.default(function (resolve, reject) {
    return _tracker2.default.queries.track(obj, resolve, reject);
  });
};

function defineConnection(conn) {
  return {
    'client.Runner.prototype.connection': {
      get: function get() {
        return conn;
      },

      set: _lodash2.default.noop
    }
  };
}

var spec = exports.spec = _lodash2.default.defaultsDeep({
  replace: [{
    client: {
      _constructor: {
        prototype: {
          _query: _query
        }
      },
      driverName: 'mocked',
      acquireConnection: _bluebird2.default.method(_lodash2.default.identity.bind(_lodash2.default, connection)),
      acquireRawConnection: _bluebird2.default.method(_lodash2.default.identity.bind(_lodash2.default, connection)),
      destroyRawConnection: function destroyRawConnection(con, cb) {
        return cb();
      },
      processResponse: processResponse,

      Runner: {
        prototype: {
          ensureConnection: function ensureConnection() {
            return _bluebird2.default.resolve(this.connection || {});
          }
        }
      }
    }
  }],

  define: defineConnection(connection)
}, _index.spec);

_lodash2.default.unset(spec.replace[0].client.Runner, 'prototype._query');
_lodash2.default.unset(spec.replace[0].client.Runner, 'prototype.processResponse');
_lodash2.default.unset(spec.replace[0].client, 'dialect');
_lodash2.default.unset(spec.replace[0].client, 'initDriver');
_lodash2.default.unset(spec.replace[0].client, 'initPool');
_lodash2.default.unset(spec.replace[0].client, 'initMigrator');

exports.default = {
  mock: function mock(db) {
    return _transformer2.default.transform(db, spec);
  },
  unmock: function unmock(db) {
    return _transformer2.default.restore(db);
  }
};