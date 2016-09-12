import knex from './knex';
import module from './module';

export default {
  name: 'SQLite',
  config : {
    dialect: 'sqlite3',
    connection: {
      filename: './data.db'
    },
    pool: {
      min: 0,
      max: 7,
    },
    useNullAsDefault: true,
  },
  knex,
  module,
};
