import knex from './knex';

export default {
  name: 'Mssql',
  config: {
    client: 'mssql',
    connection: {
      host     : '127.0.0.1',
      port     : '5433',
      user     : 'sa',
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
