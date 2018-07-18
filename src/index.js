import fs from 'fs';
import tracker from './tracker';
import semver from 'semver';
import path from 'path';
import knexPackage from 'knex/package.json';

import {
  MockSymbol,
} from './util/transformer';

const platforms = [
  'knex',
];

const knexVersion = knexPackage.version;

class MockKnex {
  adapter = null;
  _adapter = null;

  _extractVersion(version, versions) {
    if (! semver.valid(version)) {
      version += '.0';
    }

    const extracted = versions.some((v) => {
      let found = 0;

      if (semver.satisfies(version, '^' + v)) {
        found = version = v;
      }

      return found > 0;
    });

    if (! extracted) {
      throw new Error('Unable to locate version: ' + version);
    }

    return version;
  }

  _setAdapter(db, platform = 'knex', version = knexVersion) {
    let versions = fs.readdirSync(path.join(__dirname, './platforms', platform));

    if (platforms.indexOf(platform) === -1) {
      throw new Error('invalid platform: ' + platform);
    }

    versions = versions.sort((a, b) => {
      return a - b;
    });

    if (version) {
      version = this._extractVersion(version, versions);
    } else {
      version = versions.pop();
    }

    this.adapter = {
      platform,
      version,
    };

    this._adapter = require(
      path.join(
        __dirname,
        'platforms',
        this.adapter.platform,
        this.adapter.version,
        'index'
      )
    ).default;

    return this;
  }

  getTracker() {
    return tracker;
  }

  mock(db) {
    this._setAdapter(db);

    return this._adapter.mock(db);
  }

  unmock(db) {
    this._setAdapter(db);

    return this._adapter.unmock(db);
  }

  isMocked(db) {
    return !! db[MockSymbol];
  }

  getAdapter() {
    return this._adapter;
  }
}

export default new MockKnex();
