import Promise from 'bluebird';
import _ from 'lodash';
import tracker from '../../../tracker';
import transformer from '../../../util/transformer';

const connection = {
  id : 'mockedConnection',
};

export const spec = {
  replace : [
    {
      client : {
        dialect : 'mocked',
        initDriver : _.noop,
        initPool : _.noop,
        initMigrator : _.noop,
        acquireConnection : Promise.method(_.identity.bind(_, connection)),
        releaseConnection : _.noop,
        Runner : {
          prototype : {
            processResponse(obj) {
              obj = obj || {};

              if (obj.output) {
                obj.result = obj.output.call(this, obj.result);
              } else if (obj.method === 'first') {
                obj.result = Array.isArray(obj.result) ? obj.result[0] : obj.result;
              } else if (obj.method === 'pluck') {
                obj.result = _.map(obj.result, obj.pluck);
              }

              return obj.result;
            },

            _query(obj) {
              if (this.isDebugging()) {
                this.debug(obj);
              }

              return new Promise((resolve, reject) => tracker.queries.track(obj, resolve, reject));
            },
          },
        },
      },
    },
  ],
};

export default {
  mock(db) {
    return transformer.transform(db, spec);
  },

  unmock(db) {
    return transformer.restore(db);
  },
};
