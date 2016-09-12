import chai from 'chai';
import _ from 'lodash';

chai.use((chai, utils) => {
  chai.Assertion.addChainableMethod('looseEqual',
    function (val) {
      this.assert(
        val == utils.flag(this, 'object'),
        'expected #{this} to loosely equal #{exp}',
        'expected #{this} to not loosely equal #{exp}',
        val,
        this._obj,
        true
      );
    }, function () {
      utils.flag(this, 'looseEqual', true);
    }
  );

  chai.Assertion.addChainableMethod('looseInclude',
    function (val) {
      this.assert(
        _.some(utils.flag(this, 'object'), (input) => input == val),
        'expected #{this} to loosely equal #{exp}',
        'expected #{this} to not loosely equal #{exp}',
        val,
        this._obj,
        true
      );
    }, function () {
      utils.flag(this, 'looseEqual', true);
    }
  );
});

module.exports = chai;
