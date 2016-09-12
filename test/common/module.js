
import {
  describe,
  expect,
  before,
  beforeEach,
  afterEach,
  after,
  it,
} from './lab';

import * as test from './lab';

import Bookshelf from 'bookshelf';
import mod from '../../';
import tracker from '../../dist/tracker';
import { MockSymbol } from '../../dist/util/transformer';

module.exports = (db, engine) => {
  describe('Module', function moduleTests() {
    after((done) => {
      if (mod.isMocked(db)) {
        mod.unmock(db);
      }

      done();
    });

    it('should have a getTracker method', (done) => {
      expect(mod.getTracker).to.be.a('function');
      done();
    });

    it('should return an instance of the tracker', (done) => {
      expect(tracker).to.equal(mod.getTracker());
      done();
    });

    it('should have an mock method', (done) => {
      expect(mod.mock).to.be.a('function');
      done();
    });

    it('should have an unmock method', (done) => {
      expect(mod.unmock).to.be.a('function');
      done();
    });

    if (engine.module) {
      engine.module(db);
    }
  });
}
