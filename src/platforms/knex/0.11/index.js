import { spec as definition } from '../0.8/index';
import _ from 'lodash';
import transformer from '../../../util/transformer';

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
