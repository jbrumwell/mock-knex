/* global Object */
import _ from 'lodash';

export const MockSymbol = Symbol('unmock');

class Mocker {
  context(obj, path, includePrototype = false) {
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

  replace(obj, specs, options = {}) {
    const replaced = {};

    specs = _.isArray(specs) ? specs : [specs];

    _.forEach(specs, (spec) => {
      const paths = this.paths(spec);

      _.forEach(paths, (path) => {
        let replacement = _.get(spec, path);

        path = path.replace('._constructor.', '.constructor.');

        const context = this.context(obj, path, options.includePrototype);
        const name = _.last(path.split('.'));
        const replacedPath = path.replace('.constructor.', '._constructor.');

        if (! _.get(replaced, path)) {
          _.set(replaced, replacedPath, _.get(obj, path));
        }

        context[name] = replacement;
      });
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
      this.replace(obj, spec.replace, {
        includePrototype : false,
      });
    }

    if (spec.define) {
      this.undefine(obj, spec.define);
    }

    delete obj[MockSymbol];
  }
}

export default new Mocker();
