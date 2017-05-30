'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spec = undefined;

var _index = require('../0.11/index');

var _index2 = _interopRequireDefault(_index);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _transformer = require('../../../util/transformer');

var _transformer2 = _interopRequireDefault(_transformer);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connection = {
  __knexUid: 'mockedConnection',
  timeout: _bluebird2.default.method(getConnection)
};

function getConnection() {
  return connection;
}

var spec = exports.spec = _lodash2.default.defaultsDeep({
  replace: [{
    client: {
      acquireConnection: function acquireConnection() {
        return _bluebird2.default.resolve(connection);
      }
    }
  }]
}, _index.spec);

exports.default = {
  mock: function mock(db) {
    return _transformer2.default.transform(db, spec);
  },
  unmock: function unmock(db) {
    return _transformer2.default.restore(db);
  }
};