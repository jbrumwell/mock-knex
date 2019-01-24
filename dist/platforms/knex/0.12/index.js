'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spec = undefined;

var _index = require('../0.11/index');

var _index2 = require('../0.8/index');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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
      },
      destroyRawConnection: function destroyRawConnection(conn) {}
    }
  }]
}, _index.spec);

exports.default = (0, _index2.makeClient)(spec);