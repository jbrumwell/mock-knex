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
  obj.context = this;

  obj.transacting = !! this.transacting;

  return new Promise((resolve, reject) => tracker.queries.track(obj, resolve, reject));
};

export function defineConnection(conn) {
  return {
    'client.Runner.prototype.connection' : {
      get() {
        return conn;
      },
      set : _.noop,
    },
  };
}

export let spec = _.defaultsDeep({
  replace : [
    {
      client : {
        _constructor : {
          prototype : {
            _query,
          },
        },
        driverName : 'mocked',
        acquireConnection : Promise.method(_.identity.bind(_, connection)),
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

  define : defineConnection(connection),
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
