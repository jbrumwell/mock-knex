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
  mod,
  MockSymbol,
} from '../common';

export default (db) => {
  it('should revert a single adapter back to the original', (done) => {
    const run = () => {
      return db.raw('select version();');
    }

    expect(mod.isMocked(db)).to.equal(false);

    mod.mock(db);

    expect(db[MockSymbol]).to.be.a('object');

    run()
    .then((result) => {
      expect(result).to.be.undefined;

      mod.unmock(db);

      expect(db[MockSymbol]).to.be.undefined;

      return db.raw('select version();');
    })
    .then((response) => {
      const result = response.rows;
      expect(result).to.be.a('array');
      expect(result[0]).to.be.a('object');
      expect(result[0].version).to.be.a('string');
      done();
    }).catch(done);
  });
};
