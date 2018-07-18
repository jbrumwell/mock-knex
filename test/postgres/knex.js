import _ from 'lodash';
import Promise from 'bluebird';
import {
  describe,
  expect,
  before,
  beforeEach,
  afterEach,
  after,
  it,
  tracker,
} from '../common';

export default (db) => {
  it('should support schema#hasTable', (done) => {
    tracker.on('query', (query) => {
      expect(query.sql).to.be.a('string');

      expect([
        'select * from information_schema.tables where table_name = ? and table_schema = current_schema',
        'select * from information_schema.tables where table_name = ?',
        'select * from information_schema.tables where table_name = $1 and table_schema = current_schema',
        'select * from information_schema.tables where table_name = $1 and table_schema = current_schema()',
      ]).to.contain(query.sql);

      done();
    });

    db.schema.hasTable('testing').then(_.noop);
  });
};
