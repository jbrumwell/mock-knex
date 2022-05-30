import _ from "lodash";
import { expect, it, mod, MockSymbol } from "../common";

export default (db) => {
  it.skip("should revert a single adapter back to the original", (done) => {
    const run = () => {
      return db.raw("select version();");
    };

    expect(mod.isMocked(db)).to.equal(false);

    mod.mock(db);

    expect(db[MockSymbol]).to.be.a("object");

    run()
      .then((result) => {
        expect(result).to.be.undefined;

        return result;
      })
      .then((response) => {
        const result = response.rows;
        expect(result).to.be.a("array");
        expect(result[0]).to.be.a("object");
        expect(result[0].version).to.be.a("string");
        done();
      })
      .catch(done);
  });
};
