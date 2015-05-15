'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Queries(tracker) {
  this.tracker = tracker;

  this.queries = [];
}

function Tracker() {
  this.tracking = false;
  this.queries = new Queries(this);

  EventEmitter.call(this);
}

util.inherits(Tracker, EventEmitter);

Tracker.prototype.install = function install() {
  this.tracking = true;
  this.queries.reset();
};

Tracker.prototype.uninstall = function install() {
  this.tracking = false;
  this.queries.reset();
  this.removeAllListeners('query');
};

Tracker.prototype.withMock = function withMock(fn) {
  this.install();

  try {
    fn();
  } finally {
    this.uninstall();
  }
};

Queries.prototype.reset = function reset() {
  this.queries = [];
};

Queries.prototype.track = function track(query, resolver) {
  var step;

  if (this.tracker.tracking) {
    query.response = function response(result) {
      query.result = result;
      resolver(query);
    };

    delete query.result;

    step = this.queries.push(query);
    this.tracker.emit('query', query, step);
  } else {
    resolver();
  }
};

Queries.prototype.first = function first() {
  return this.queries[0];
};

Queries.prototype.count = function count() {
  return this.queries.length;
};

Queries.prototype.last = function last() {
  return this.queries[ this.count() - 1 ];
};

Queries.prototype.step = function at(step) {
  return this.queries[ step - 1 ];
};

module.exports = new Tracker();
