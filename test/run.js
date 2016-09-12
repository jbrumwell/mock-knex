
import knex from 'knex';
import { tests } from './common';
import {
  lab,
  describe,
} from './common/lab';

import sqlite from './sqlite';
import postgres from './postgres';
import mysql from './mysql';

[
  sqlite,
  postgres,
  mysql,
].forEach((engine) => {
  const db = knex(engine.config);

  tests.forEach((test) => {
    describe(engine.name, () => {
      test(db, engine);
    });
  });
})

export default lab;
