import {
  spec as definition,
} from '../0.11/index';

import {
  makeClient,
} from '../0.8/index';

import _ from 'lodash';
import Promise from 'bluebird';

const connection = {
  __knexUid : 'mockedConnection',
  timeout : Promise.method(getConnection),
};

function getConnection() {
  return connection;
}

export const spec = _.defaultsDeep({
  replace : [
    {
      client : {
        acquireConnection() {
          return Promise.resolve(connection);
        },
        destroyRawConnection(conn) {},
      },
    },
  ],
}, definition);

export default makeClient(spec);
