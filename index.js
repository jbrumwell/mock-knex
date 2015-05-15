'use strict';

var _ = require('lodash');
var fs = require('fs');
var tracker = require('./lib/tracker');
var semver = require('semver');
var path = require('path');

var platforms = [
  'knex',
];

function getAdapter(adapter) {
  var platform;
  var version;
  var parts;

  parts = adapter.split('@');
  platform = parts[0];
  version = parts[1];

  if (platforms.indexOf(platform) === -1) {
    throw new Error('invalid platform: ' + platform);
  }

  var versions = fs.readdirSync('./lib/platforms/' + platform);

  if (version) {
    version = semver.maxSatisfying(versions, version, true);
  } else {
    versions = versions.sort(function(a, b) {
      return a - b;
    });

    version = versions.pop();
  }

  return require(path.join(__dirname, './lib/platforms', platform, version));
}

function getTracker() {
  return tracker;
}

module.exports = {
  getTracker : getTracker,
  mock : function (db, adapter) {
    if (_.isString(adapter)) {
      adapter = getAdapter(adapter);
    }

    return adapter.mock(db);
  },

  unmock : function (db, adapter) {
    if (_.isString(adapter)) {
      adapter = getAdapter(adapter);
    }

    return adapter.unmock(db);
  },
}
