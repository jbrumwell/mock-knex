import {
  spec as definition,
  defineConnection,
  makeClient,
} from '../0.8/index';
import _ from 'lodash';
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

export default makeClient(spec);
