var makeClient = require('./client');
var clone = require('../../../util/clone');

module.exports = {
  mock: function mockDatabase(db) {
    if (! db._oldClient) {
      db._oldClient = clone(db.client);
    }

    makeClient(db);
  },

  unmock: function unmock(db) {
    if (db._oldClient) {
      db.client = db._oldClient;
      delete db._oldClient;
    }
  },
};
