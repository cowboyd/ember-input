import resolver from './helpers/resolver';
import { setResolver } from 'ember-mocha';

setResolver(resolver);

export var describe = window.describe;
export var it = window.it;
export var beforeEach = window.beforeEach;
export var afterEach = window.afterEach;
