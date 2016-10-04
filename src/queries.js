import _ from 'lodash';

export default class Queries {
  queries = [];

  constructor(tracker) {
    this.tracker = tracker;
  }

  reset() {
    this.queries = [];

    return this;
  }

  track(query, resolve, reject) {
    if (this.tracker.tracking) {
      query.mock = {
        ..._.get(query, 'mock', {}),
        ..._.pick(query, [
          'method',
          'sql',
          'bindings',
          'returning',
          'transacting',
        ]),

        response(response, options = {}) {
          if (! options.stream) {
            query.result = response;
            resolve(query);
          } else {
            resolve({
              response,
            });
          }
        },

        resolve(result) {
          return query.response(result);
        },

        reject(error) {
          if (_.isString(error)) {
            error = new Error(error);
          }

          reject(error);
        },
      };

      delete query.result;

      query.mock.step = this.queries.push(query);

      this.tracker.emit('query', query.mock, query.mock.step);
    } else {
      resolve();
    }
  }

  first() {
    return this.queries[0];
  }

  count() {
    return this.queries.length;
  }

  last() {
    return this.queries[ this.count() - 1 ];
  }

  step(step) {
    return this.queries[ step - 1 ];
  }
}
