/* global Object */
import _ from 'lodash';

export const MockSymbol = Symbol('unmock');

class Mocker {
  context(obj, path) {
    const paths = path.split('.');

    paths.pop();

    return _.get(obj, paths, obj);
  }

  paths(obj, parent) {
    return _.chain(obj)
    .map((value, key) => {
      let out;

      if (_.isPlainObject(value)) {
        out = this.paths(value, parent ? `${parent}.${key}` : key);
      } else {
        out = parent ? `${parent}.${key}` : key;
      }

      return out;
    })
    .flatten()
    .value();
  }

  _replace(obj, spec, replaced, path) {
    let replacement = _.get(spec, path);

    path = path.replace('._constructor.', '.constructor.').replace('._prototype.', '.prototype.');

    const context = this.context(obj, path);
    const name = _.last(path.split('.'));
    const replacedPath = path.replace('.constructor.', '._constructor.').replace('.prototype.', '._prototype.');
    

    if (! _.get(replaced, path)) {
      _.set(replaced, replacedPath, _.get(obj, path));
    }

    context[name] = replacement;
  }

  replace(obj, specs) {
    const replaced = {};

    specs = _.isArray(specs) ? specs : [specs];

    _.forEach(specs, (spec) => {
      const paths = _.partition(this.paths(spec), (path) => {
        return path.indexOf('_constructor') === -1;
      });

      _.forEach(paths[0], this._replace.bind(this, obj, spec, replaced));
      _.forEach(paths[1], this._replace.bind(this, obj, spec, replaced));

    });

    this.restorer.replace = replaced;

    return obj;
  }

  undefine(obj, specs) {
    specs = _.isArray(specs) ? specs : [specs];

    _.forEach(specs, (spec) => {
      const paths = this.paths(spec);

      _.forEach(paths, (path) => {
        const context = this.context(obj, path, true);
        const property = path.split('.').pop();
        const value = _.get(spec, path);

        if (_.isUndefined(value)) {
          delete context[ property ];
        } else {
          context[ property ] = value;
        }
      });
    });

    return obj;
  }

  define(obj, specs) {
    const defined = {};

    specs = _.isArray(specs) ? specs : [specs];

    _.forEach(specs, (spec) => {
      _.forEach(spec, (descriptors, path) => {
        const context = this.context(obj, path, true);
        const property = path.split('.').pop();

        if (! _.get(defined, path)) {
          _.set(defined, path, _.get(obj, path));
        }

        descriptors.configurable = true;

        Object.defineProperty(context, property, descriptors);
      });
    });

    this.restorer.define = defined;

    return obj;
  }

  transform(obj, spec) {
    this.restorer = {};

    if (obj[MockSymbol]) {
      throw new Error('Unable to transform, this database is already mocked');
    }

    if (spec.replace) {
      this.replace(obj, spec.replace);
    }

    if (spec.define) {
      this.define(obj, spec.define);
    }

    obj[MockSymbol] = this.restorer;

    return obj;
  }

  restore(obj) {
    const spec = obj[MockSymbol];

    this.restorer = {};

    if (! spec) {
      throw new Error('Unable to locate mocked data to revert');
    }

    if (spec.replace) {
      this.replace(obj, spec.replace);
    }

    if (spec.define) {
      this.undefine(obj, spec.define);
    }

    delete obj[MockSymbol];
  }
}

export default new Mocker();
