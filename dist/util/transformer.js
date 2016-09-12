'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MockSymbol = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global Object */


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MockSymbol = exports.MockSymbol = Symbol('unmock');

var Mocker = function () {
  function Mocker() {
    _classCallCheck(this, Mocker);
  }

  _createClass(Mocker, [{
    key: 'context',
    value: function context(obj, path) {
      var paths = path.split('.');

      paths.pop();

      return _lodash2.default.get(obj, paths, obj);
    }
  }, {
    key: 'paths',
    value: function paths(obj, parent) {
      var _this = this;

      return _lodash2.default.chain(obj).map(function (value, key) {
        var out = void 0;

        if (_lodash2.default.isPlainObject(value)) {
          out = _this.paths(value, parent ? parent + '.' + key : key);
        } else {
          out = parent ? parent + '.' + key : key;
        }

        return out;
      }).flatten().value();
    }
  }, {
    key: '_replace',
    value: function _replace(obj, spec, replaced, path) {
      var replacement = _lodash2.default.get(spec, path);

      path = path.replace('._constructor.', '.constructor.');

      var context = this.context(obj, path);
      var name = _lodash2.default.last(path.split('.'));
      var replacedPath = path.replace('.constructor.', '._constructor.');

      if (!_lodash2.default.get(replaced, path)) {
        _lodash2.default.set(replaced, replacedPath, _lodash2.default.get(obj, path));
      }

      context[name] = replacement;
    }
  }, {
    key: 'replace',
    value: function replace(obj, specs) {
      var _this2 = this;

      var replaced = {};

      specs = _lodash2.default.isArray(specs) ? specs : [specs];

      _lodash2.default.forEach(specs, function (spec) {
        var paths = _lodash2.default.partition(_this2.paths(spec), function (path) {
          return path.indexOf('_constructor') === -1;
        });

        _lodash2.default.forEach(paths[0], _this2._replace.bind(_this2, obj, spec, replaced));
        _lodash2.default.forEach(paths[1], _this2._replace.bind(_this2, obj, spec, replaced));
      });

      this.restorer.replace = replaced;

      return obj;
    }
  }, {
    key: 'undefine',
    value: function undefine(obj, specs) {
      var _this3 = this;

      specs = _lodash2.default.isArray(specs) ? specs : [specs];

      _lodash2.default.forEach(specs, function (spec) {
        var paths = _this3.paths(spec);

        _lodash2.default.forEach(paths, function (path) {
          var context = _this3.context(obj, path, true);
          var property = path.split('.').pop();
          var value = _lodash2.default.get(spec, path);

          if (_lodash2.default.isUndefined(value)) {
            delete context[property];
          } else {
            context[property] = value;
          }
        });
      });

      return obj;
    }
  }, {
    key: 'define',
    value: function define(obj, specs) {
      var _this4 = this;

      var defined = {};

      specs = _lodash2.default.isArray(specs) ? specs : [specs];

      _lodash2.default.forEach(specs, function (spec) {
        _lodash2.default.forEach(spec, function (descriptors, path) {
          var context = _this4.context(obj, path, true);
          var property = path.split('.').pop();

          if (!_lodash2.default.get(defined, path)) {
            _lodash2.default.set(defined, path, _lodash2.default.get(obj, path));
          }

          descriptors.configurable = true;

          Object.defineProperty(context, property, descriptors);
        });
      });

      this.restorer.define = defined;

      return obj;
    }
  }, {
    key: 'transform',
    value: function transform(obj, spec) {
      this.restorer = {};

      if (obj[MockSymbol]) {
        throw new Error('Unable to transform, this database is already mocked');
      }

      if (spec.replace) {
        this.replace(obj, spec.replace);
      }

      if (spec.define) {
        this.define(obj, spec.define);
      }

      obj[MockSymbol] = this.restorer;

      return obj;
    }
  }, {
    key: 'restore',
    value: function restore(obj) {
      var spec = obj[MockSymbol];

      this.restorer = {};

      if (!spec) {
        throw new Error('Unable to locate mocked data to revert');
      }

      if (spec.replace) {
        this.replace(obj, spec.replace);
      }

      if (spec.define) {
        this.undefine(obj, spec.define);
      }

      delete obj[MockSymbol];
    }
  }]);

  return Mocker;
}();

exports.default = new Mocker();