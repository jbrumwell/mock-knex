import client, { spec as definition } from '../0.11/index';
import _ from 'lodash';
import transformer from '../../../util/transformer';
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
      },
    },
  ],
}, definition);

export default {
  mock(db) {
    return transformer.transform(db, spec);
  },

  unmock(db) {
    return transformer.restore(db);
  },
};
