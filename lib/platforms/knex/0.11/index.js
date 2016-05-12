var makeClient = require('./client');

module.exports = {
  mock: function mockDatabase(db) {
    if (! db._oldClient) {
      db._oldClient = db.client;
    }

    makeClient(db);
  },

  unmock: function unmock(db) {
    db.client = db._oldClient;
    delete db._oldClient;
  },
};
