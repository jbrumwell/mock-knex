import Promise from 'bluebird';
import _ from 'lodash';
import tracker from '../../../tracker';
import transformer from '../../../util/transformer';

const connection = {
  id : 'mockedConnection',
};

const processResponse = function(obj) {
  obj = obj || {};

  if (obj.output) {
    obj.result = obj.output.call(this, obj.result);
  } else if (obj.method === 'first') {
    obj.result = Array.isArray(obj.result) ? obj.result[0] : obj.result;
  } else if (obj.method === 'pluck') {
    obj.result = _.map(obj.result, obj.pluck);
  }

  return obj.result;
};

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

export let spec = {
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
        releaseConnection : _.noop,
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
};

export default {
  mock(db) {
    return transformer.transform(db, spec);
  },

  unmock(db) {
    return transformer.restore(db);
  },
};
