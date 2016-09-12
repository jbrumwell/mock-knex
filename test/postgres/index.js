import knex from './knex';
import module from './module';

export default {
  name: 'Postgresql',
  config: {
    client: 'pg',
    connection: {
      host     : '127.0.0.1',
      user     : 'mockKnex',
      password : 'mockKnex',
      database : 'mockKnex'
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
