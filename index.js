'use strict';

var tracker = require('./lib/tracker');
var client  = require('./lib/mock');
var knex    = require('knex');

function mockedAdapter() {
  return client;
}

function mockAdapter(name) {
  if (name) {
    knex.Clients[ name ] = mockedAdapter;
  } else {
    Object.keys(knex.Clients).forEach(mockAdapter);
  }
}

function getTracker() {
  return tracker;
}

module.exports = {
  getTracker : getTracker,
  mock : mockAdapter
}
