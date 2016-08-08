var client = require('./client');

module.exports = {
  mock: function mockDatabase(db) {
    client.mock(db);
  },

  unmock: function unmock(db) {
    client.unmock(db);
  },
};
