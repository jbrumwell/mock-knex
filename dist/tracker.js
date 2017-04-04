'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _queries = require('./queries');

var _queries2 = _interopRequireDefault(_queries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracker = function (_EventEmitter) {
  _inherits(Tracker, _EventEmitter);

  function Tracker() {
    _classCallCheck(this, Tracker);

    var _this = _possibleConstructorReturn(this, (Tracker.__proto__ || Object.getPrototypeOf(Tracker)).apply(this, arguments));

    _this.tracking = false;

    _this.queries = new _queries2.default(_this);
    return _this;
  }

  _createClass(Tracker, [{
    key: 'install',
    value: function install() {
      this.tracking = true;
      this.queries.reset();
    }
  }, {
    key: 'uninstall',
    value: function uninstall() {
      this.tracking = false;
      this.queries.reset();
      this.removeAllListeners('query');
    }
  }, {
    key: 'wrap',
    value: function wrap(cb) {
      this.install();

      try {
        cb();
      } finally {
        this.uninstall();
      }
    }
  }, {
    key: 'withMock',
    value: function withMock() {
      return this.with();
    }
  }]);

  return Tracker;
}(_events.EventEmitter);

exports.default = new Tracker();