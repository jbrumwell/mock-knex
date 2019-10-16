
import knex from 'knex';
import { tests } from './common';
import {
  lab,
  describe,
} from './common/lab';

import sqlite from './sqlite';
import postgres from './postgres';
import mysql from './mysql';
import mssql from './mssql';
import pkg from '../package.json';

const currentKnexVersion = pkg.dependencies.knex.split('.')[1];
const knexVersionsWithNoMSSQL = [ '8', '9', '10', '15' ];

const engines = [
  sqlite,
  postgres,
  mysql
];

if(!knexVersionsWithNoMSSQL.includes(currentKnexVersion)) {
  engines.push(mssql);
}

engines.forEach((engine) => {
  const db = knex(engine.config);

  tests.forEach((test) => {
    describe(engine.name, () => {
      test(db, engine);
    });
  });
})

export default lab;
