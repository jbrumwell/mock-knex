'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Queries = function () {
  function Queries(tracker) {
    _classCallCheck(this, Queries);

    this.queries = [];

    this.tracker = tracker;
  }

  _createClass(Queries, [{
    key: 'reset',
    value: function reset() {
      this.queries = [];

      return this;
    }
  }, {
    key: 'track',
    value: function track(query, resolve, _reject) {
      if (this.tracker.tracking) {
        query.mock = _extends({}, _lodash2.default.get(query, 'mock', {}), _lodash2.default.pick(query, ['method', 'sql', 'bindings', 'returning', 'transacting']), {
          response: function response(_response) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (!options.stream) {
              query.result = _response;
              resolve(query);
            } else {
              resolve({
                response: _response
              });
            }
          },
          resolve: function resolve(result) {
            return query.response(result);
          },
          reject: function reject(error) {
            if (_lodash2.default.isString(error)) {
              error = new Error(error);
            }

            _reject(error);
          }
        });

        delete query.result;

        query.mock.step = this.queries.push(query);

        this.tracker.emit('query', query.mock, query.mock.step);
      } else {
        resolve();
      }
    }
  }, {
    key: 'first',
    value: function first() {
      return this.queries[0];
    }
  }, {
    key: 'count',
    value: function count() {
      return this.queries.length;
    }
  }, {
    key: 'last',
    value: function last() {
      return this.queries[this.count() - 1];
    }
  }, {
    key: 'step',
    value: function step(_step) {
      return this.queries[_step - 1];
    }
  }]);

  return Queries;
}();

exports.default = Queries;