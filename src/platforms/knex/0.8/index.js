import Promise from 'bluebird';
import _ from 'lodash';
import tracker from '../../../tracker';
import { spec as definition } from '../0.7/index';
import transformer from '../../../util/transformer';

const connection = {
  id : 'mockedConnection',
};

const processResponse = _.get(definition, 'replace[0].client.Runner.prototype.processResponse');
const _query = function _query(con, obj) {
  return new Promise((resolve, reject) => tracker.queries.track(obj, resolve, reject));
};

export let spec = _.defaultsDeep({
  replace : [
    {
      client : {
        constructor : {
          prototype : {
            _query,
          },
        },
        driverName : 'mocked',
        acquireRawConnection : Promise.method(_.identity.bind(_, connection)),
        destroyRawConnection : (con, cb) => cb(),
        processResponse,

        Runner : {
          prototype : {
            ensureConnection() {
              return Promise.resolve(this.connection || {});
            },
          },
        },
      },
    },
  ],

  define : {
    'client.Runner.prototype.connection' : {
      get() {
        return connection;
      },
      set : _.noop,
    },
  },
}, definition);

_.unset(spec.replace[0].client.Runner, 'prototype._query');
_.unset(spec.replace[0].client.Runner, 'prototype.processResponse');
_.unset(spec.replace[0].client, 'dialect');
_.unset(spec.replace[0].client, 'initDriver');
_.unset(spec.replace[0].client, 'initPool');
_.unset(spec.replace[0].client, 'initMigrator');

export default {
  mock(db) {
    return transformer.transform(db, spec);
  },

  unmock(db) {
    return transformer.restore(db);
  },
};
