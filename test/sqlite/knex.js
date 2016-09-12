import _ from 'lodash';
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
      expect(query.sql).to.equal('select * from sqlite_master where type = \'table\' and name = ?');
      done();
    });

    db.schema.hasTable('testing').then(_.noop);
  });
};
