'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spec = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _tracker = require('../../../tracker');

var _tracker2 = _interopRequireDefault(_tracker);

var _transformer = require('../../../util/transformer');

var _transformer2 = _interopRequireDefault(_transformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connection = {
  id: 'mockedConnection'
};

var spec = exports.spec = {
  replace: [{
    client: {
      dialect: 'mocked',
      initDriver: _lodash2.default.noop,
      initPool: _lodash2.default.noop,
      initMigrator: _lodash2.default.noop,
      acquireConnection: _bluebird2.default.method(_lodash2.default.identity.bind(_lodash2.default, connection)),
      releaseConnection: _lodash2.default.noop,
      Runner: {
        prototype: {
          processResponse: function processResponse(obj) {
            obj = obj || {};

            if (obj.output) {
              obj.result = obj.output.call(this, obj.result);
            } else if (obj.method === 'first') {
              obj.result = Array.isArray(obj.result) ? obj.result[0] : obj.result;
            } else if (obj.method === 'pluck') {
              obj.result = _lodash2.default.map(obj.result, obj.pluck);
            }

            return obj.result;
          },
          _query: function _query(obj) {
            if (this.isDebugging()) {
              this.debug(obj);
            }

            if (this.transacting) {
              obj.transacting = !!this.transacting;
            }

            return new _bluebird2.default(function (resolve, reject) {
              return _tracker2.default.queries.track(obj, resolve, reject);
            });
          }
        }
      }
    }
  }]
};

exports.default = {
  mock: function mock(db) {
    return _transformer2.default.transform(db, spec);
  },
  unmock: function unmock(db) {
    return _transformer2.default.restore(db);
  }
};