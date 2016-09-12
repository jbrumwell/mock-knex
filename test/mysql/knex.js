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
      expect(query.sql).to.equal('show tables like ?');

      done();
    });

    db.schema.hasTable('testing').then(_.noop);
  });
};
