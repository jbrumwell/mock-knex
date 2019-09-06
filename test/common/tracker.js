import _ from 'lodash';

import {
  describe,
  expect,
  before,
  beforeEach,
  afterEach,
  after,
  it,
} from './lab';

import Bookshelf from 'bookshelf';
import mod from '../../';
import tracker from '../../dist/tracker';
import { MockSymbol } from '../../dist/util/transformer';

module.exports = (db) => {
  describe('Tracker', function trackerTests() {
    before((done) => {
      mod.mock(db);
      done();
    });

    after((done) => {
      mod.unmock(db);
      done();
    })

    beforeEach((done) => {
      tracker.install();
      done();
    });

    afterEach((done) => {
      tracker.uninstall();
      done();
    });

    it('should not track if not installed', (done) => {
      tracker.uninstall();
      db('users').select().then(function() {
        expect(tracker.queries.count()).to.equal(0);
        done();
      });
    });

    it('should track if installed', (done) => {
      tracker.once('query', (query) => {
        expect(tracker.queries.count()).to.equal(1);
        done();
      });

      db('users').select().then(_._.noop);
    });

    it('uninstall should stop tracking', (done) => {
      expect(tracker.tracking).to.equal(true);

      tracker.uninstall();

      expect(tracker.tracking).to.equal(false);

      done();
    });

    it('should return a query object with a response method',
    (done) => {
      tracker.install();

      tracker.once('query', (query) => {
        expect(query).to.have.property('response');
        expect(query.response).to.be.a('function');
        expect(query.reject).to.be.a('function');
        expect(query.transacting).to.be.a('boolean');
        done();
      });

      db('users').select().then(_.noop);
    });

    it('should allow passing custom attributes to query',
    (done) => {
      tracker.install();

      tracker.once('query', (query) => {
        expect(query).to.have.property('custom');
        expect(query.custom).to.be.a('boolean');
        done();
      });

      tracker.queries.track({
        mock : {
          custom : true,
        },
      })
    });

    it('should return a query object with a method property',
    (done) => {
      tracker.once('query', (query) => {
        expect(query).to.have.property('method');
        expect(query.method).to.be.a('string');
        tracker.uninstall();
        done();
      });

      db('users').select().then(_.noop);
    });

    it('should return a query object with a bindings property',
    (done) => {
      tracker.once('query', (query) => {
        expect(query).to.have.property('bindings');
        expect(query.bindings).to.be.a('array');
        done();
      });

      db('users').select().then(_.noop);
    });

    it('should return a query object with a sql property',
    (done) => {
      tracker.once('query', (query) => {
        expect(query).to.have.property('sql');
        expect(query.sql).to.be.a('string');
        tracker.uninstall();
        done();
      });

      db('users').select().then(_.noop);
    });

    it('should be able to get the first query',
    (done) => {
      tracker.on('query', (query, step) => {
        query.index = step;

        if (step === 3) {
          expect(tracker.queries.first().mock.index).to.equal(1);
          tracker.uninstall();
          done();
        }
      });

      db('users').select().then(_.noop);
      db('users').select().then(_.noop);
      db('users').select().then(_.noop);
    });

    it('should be able to get the last query',
    (done) => {
      tracker.on('query', (query, step) => {
        query.index = step;

        if (step === 3) {
          expect(tracker.queries.last().mock.index).to.equal(3);
          tracker.uninstall();
          done();
        }
      });

      db('users').select().then(_.noop);
      db('users').select().then(_.noop);
      db('users').select().then(_.noop);
    });

    it('should be able to get a query at a specific step',
    (done) => {
      tracker.on('query', (query, step) => {
        query.index = step;

        if (step === 3) {
          expect(tracker.queries.step(2).mock.index).to.equal(2);
          tracker.uninstall();
          done();
        }
      });

      db('users').select().then(_.noop);
      db('users').select().then(_.noop);
      db('users').select().then(_.noop);
    });

    it('should pass a step parameters to the query event',
    (done) => {
      var index = 1;

      tracker.on('query', (query, step) => {
        expect(step).to.equal(index);

        ++index;

        if (step === 3) {
          tracker.uninstall();
          done();
        }
      });

      db('users').select().then(_.noop);
      db('users').select().then(_.noop);
      db('users').select().then(_.noop);
    });

    it('should reply with the data passed to the query#response', (done) => {
      tracker.on('query', (query) => {
        query.response({ works : true });
      });

      db.select('field').from('test-table').then((result) => {
        expect(result).to.be.a('object');
        expect(result.works).to.equal(true);
        done();
      });
    });

    it('query#reject', (done) => {
      tracker.on('query', (query) => {
        query.reject('i threw up');
      });

      db.select('field').from('test-table').catch((error) => {
        expect(error.message).to.be.a('string');
        expect(error.message.indexOf('i threw up')).to.not.equal(-1);
        done();
      });
    });

    it('query#reject error instance', (done) => {
      tracker.on('query', (query) => {
        query.reject(new Error('i threw up'));
      });

      db.select('field').from('test-table').catch((error) => {
        expect(error.message).to.be.a('string');
        expect(error.message.indexOf('i threw up')).to.not.equal(-1);
        done();
      });
    });
  });
}
