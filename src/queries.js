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
    let step;

    if (this.tracker.tracking) {
      query.response = function(response, options = {}) {
        if (! options.stream) {
          query.result = response;
          resolve(query);
        } else {
          resolve({
            response,
          });
        }
      };

      query.resolve = function(result) {
        return query.response(result);
      };

      query.reject = function(error) {
        if (_.isString(error)) {
          error = new Error(error);
        }

        reject(error);
      };

      delete query.result;

      step = this.queries.push(query);
      this.tracker.emit('query', query, step);
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
