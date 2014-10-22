'use strict';

var inherits = require('util').inherits;
var SQLite3 = require('knex/lib/dialects/sqlite3/index');
var Promise = require('knex/lib/promise');

function Mocked(config) {
  config = config || {};

  SQLite3.super_.apply(this, arguments);

  if (config.debug) {
    this.isDebugging = true;
  }

  this.name = config.name || 'knex_database';
  this.version = config.version || '1.0';
  this.displayName = config.displayName || this.name;
  this.estimatedSize = config.estimatedSize || 5 * 1024 * 1024;
  this.initDriver();
  this.initRunner();

  this.transaction = function transaction() {
    return this;
  };
}

inherits(Mocked, SQLite3);

Mocked.prototype.dialect = 'mocked';
Mocked.prototype.initDriver = function() {};
Mocked.prototype.initPool = function() {};
Mocked.prototype.initMigrator = function() {};

Mocked.prototype.initRunner = function() {
  require('./runner')(this);
};

Mocked.prototype.acquireConnection = Promise.method(function() {
  return {};
});

Mocked.prototype.releaseConnection = Promise.method(function() {});

module.exports = Mocked;
