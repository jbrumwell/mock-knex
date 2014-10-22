'use strict';

var _ = require('lodash');
var knex = require('knex');
var client = require('./lib/knex');
var knexClients;
var tracker = require('./lib/tracker');

function mockedKnex() {
  return client;
}

function mockKnex(names) {
  if (! knexClients) {
    knexClients = _.extend({}, knex.Clients);
  }

  if (names) {
    names = Array.isArray(names) ? names : [ names ];

    names.forEach(function(c) {
      knex.Clients[ c ] = mockedKnex;
    });
  } else {
    Object.keys(knex.Clients).forEach(mockKnex);
  }
}

function unmockKnex() {
  knex.Clients = _.extend({}, knexClients);
  knexClients = void 0;
}

function getTracker() {
  return tracker;
}

module.exports = {
  getTracker : getTracker,
  knex : {
    install : mockKnex,
    uninstall : unmockKnex
  }
}
