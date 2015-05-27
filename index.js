'use strict';

var _ = require('lodash');
var fs = require('fs');
var tracker = require('./lib/tracker');
var semver = require('semver');
var path = require('path');

var platforms = [
  'knex',
];

function MockDb() {
  this.adapter = null;
  this._adapter = null;
}

MockDb.prototype.getTracker = function getTracker() {
  return tracker;
};

MockDb.prototype.mock = function mock(db, adapter) {
  if (adapter) {
    this.setAdapter(adapter);
  }

  return this._adapter.mock(db);
};

MockDb.prototype.unmock = function unmock(db, adapter) {
  if (adapter) {
    this.setAdapter(adapter);
  }

  return this._adapter.unmock(db);
};

MockDb.prototype.setAdapter = function setAdapter(adapter) {
  var parts;
  var version;
  var platform;

  if (_.isString(adapter)) {
    parts = adapter.split('@');
    platform = parts[0];
    version = parts[1];

    if (platforms.indexOf(platform) === -1) {
      throw new Error('invalid platform: ' + platform);
    }

    var versions = fs.readdirSync(path.join(__dirname, './lib/platforms', platform));

    versions = versions.sort(function(a, b) {
      return a - b;
    });

    if (version) {
      if (! semver.valid(version)) {
        version += '.0';
      }
      versions.some(function(v) {
        var found = 0;

        if (semver.satisfies(version, '^' + v)) {
          found = version = v;
        }

        return found > 0;
      });
    } else {
      version = versions.pop();
    }

    this.adapter = {
      platform: platform,
      version: version,
    };
  } else {
    this.adapter = adapter;
  }

  this._adapter = require(
    path.join(
      __dirname,
      './lib/platforms',
      this.adapter.platform,
      this.adapter.version
    )
  );

  return this;
};

MockDb.prototype.getAdapter = function getAdapter() {
  if (this._adapter === null) {
    throw new Error('No Adapter has been set, see setAdapter');
  }

  return this._adapter;
};


module.exports = new MockDb();
