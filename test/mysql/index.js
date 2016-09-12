import knex from './knex';

export default {
  name: 'Mysql',
  config: {
    client: 'mysql',
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
};
