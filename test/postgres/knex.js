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
      try {
        expect(query.sql).to.equal('select * from information_schema.tables where table_name = ? and table_schema = current_schema');
      } catch (e) {
        expect(query.sql).to.equal('select * from information_schema.tables where table_name = ?');
      }

      done();
    });

    db.schema.hasTable('testing').then(_.noop);
  });
};
