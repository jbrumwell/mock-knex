'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _tracker = require('./tracker');

var _tracker2 = _interopRequireDefault(_tracker);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _package = require('knex/package.json');

var _package2 = _interopRequireDefault(_package);

var _transformer = require('./util/transformer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var platforms = ['knex'];

var knexVersion = _package2.default.version;

var MockKnex = function () {
  function MockKnex() {
    _classCallCheck(this, MockKnex);

    this.adapter = null;
    this._adapter = null;
  }

  _createClass(MockKnex, [{
    key: '_extractVersion',
    value: function _extractVersion(version, versions) {
      if (!_semver2.default.valid(version)) {
        version += '.0';
      }

      var extracted = versions.some(function (v) {
        var found = 0;

        if (_semver2.default.satisfies(version, '^' + v)) {
          found = version = v;
        }

        return found > 0;
      });

      if (!extracted) {
        throw new Error('Unable to locate version: ' + version);
      }

      return version;
    }
  }, {
    key: '_setAdapter',
    value: function _setAdapter(db) {
      var platform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'knex';
      var version = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : knexVersion;

      var versions = _fs2.default.readdirSync(_path2.default.join(__dirname, './platforms', platform));

      if (platforms.indexOf(platform) === -1) {
        throw new Error('invalid platform: ' + platform);
      }

      versions = versions.sort(function (a, b) {
        return a - b;
      });

      if (version) {
        version = this._extractVersion(version, versions);
      } else {
        version = versions.pop();
      }

      this.adapter = {
        platform: platform,
        version: version
      };

      this._adapter = require(_path2.default.join(__dirname, 'platforms', this.adapter.platform, this.adapter.version, 'index')).default;

      return this;
    }
  }, {
    key: 'getTracker',
    value: function getTracker() {
      return _tracker2.default;
    }
  }, {
    key: 'mock',
    value: function mock(db) {
      this._setAdapter(db);

      return this._adapter.mock(db);
    }
  }, {
    key: 'unmock',
    value: function unmock(db) {
      this._setAdapter(db);

      return this._adapter.unmock(db);
    }
  }, {
    key: 'isMocked',
    value: function isMocked(db) {
      return !!db[_transformer.MockSymbol];
    }
  }, {
    key: 'getAdapter',
    value: function getAdapter() {
      return this._adapter;
    }
  }]);

  return MockKnex;
}();

exports.default = new MockKnex();