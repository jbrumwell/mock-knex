import {
  script,
} from 'lab';

export {
  expect,
  assert,
} from './chai';

export const lab = script();

export const {
  describe,
  before,
  beforeEach,
  afterEach,
  after,
  it,
} = lab;
