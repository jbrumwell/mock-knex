'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spec = undefined;

var _index = require('../0.8/index');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _transformer = require('../../../util/transformer');

var _transformer2 = _interopRequireDefault(_transformer);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connection = {
  id: 'mockedConnection'
};

var spec = exports.spec = _lodash2.default.defaultsDeep({
  replace: [{
    client: {
      acquireConnection: function acquireConnection() {
        return {
          completed: connection,
          abort: _lodash2.default.noop
        };
      },


      acquireRawConnection: _bluebird2.default.method(_lodash2.default.identity.bind(_lodash2.default, {
        completed: connection,
        abort: _lodash2.default.noop
      })),

      releaseConnection: _bluebird2.default.method(_lodash2.default.noop)
    }
  }],

  define: (0, _index.defineConnection)(connection)
}, _index.spec);

exports.default = {
  mock: function mock(db) {
    return _transformer2.default.transform(db, spec);
  },
  unmock: function unmock(db) {
    return _transformer2.default.restore(db);
  }
};