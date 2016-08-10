import { spec as definition, defineConnection } from '../0.8/index';
import _ from 'lodash';
import transformer from '../../../util/transformer';
import Promise from 'bluebird';

const connection = {
  id : 'mockedConnection',
};

export const spec = _.defaultsDeep({
  replace : [
    {
      client : {
        acquireConnection() {
          return {
            completed : connection,
            abort : _.noop,
          };
        },

        acquireRawConnection : Promise.method(_.identity.bind(_, {
          completed : connection,
          abort : _.noop,
        })),

        releaseConnection : Promise.method(_.noop),
      },
    },
  ],

  define : defineConnection(connection),
}, definition);

export default {
  mock(db) {
    return transformer.transform(db, spec);
  },

  unmock(db) {
    return transformer.restore(db);
  },
};
