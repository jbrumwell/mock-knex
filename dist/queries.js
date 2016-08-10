'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
    value: function track(query, resolve, reject) {
      var step = void 0;

      if (this.tracker.tracking) {
        query.response = function (response) {
          var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

          if (!options.stream) {
            query.result = response;
            resolve(query);
          } else {
            resolve({
              response: response
            });
          }
        };

        query.resolve = function (result) {
          return query.response(result);
        };

        query.reject = function (error) {
          if (_lodash2.default.isString(error)) {
            error = new Error(error);
          }

          reject(error);
        };

        delete query.result;

        step = this.queries.push(query);

        this.tracker.emit('query', query, step);
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