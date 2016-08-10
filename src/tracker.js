import { EventEmitter } from 'events';
import Queries from './queries';

class Tracker extends EventEmitter {
  tracking = false;

  constructor() {
    super(...arguments);
    this.queries = new Queries(this);
  }

  install() {
    this.tracking = true;
    this.queries.reset();
  }

  uninstall() {
    this.tracking = false;
    this.queries.reset();
    this.removeAllListeners('query');
  }

  wrap(cb) {
    this.install();

    try {
      cb();
    } finally {
      this.uninstall();
    }
  }

  withMock() {
    return this.with();
  }
}

export default new Tracker();
