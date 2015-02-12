import Ember from 'ember';
import resolver from './helpers/resolver';
import { setResolver } from 'ember-mocha';

setResolver(resolver);

export var describe = window.describe;
export var it = window.it;
export function beforeEach(fn) {
  return window.beforeEach(function() {
    var _this = this;
    Ember.run(function() {
      fn.call(_this);
    });
  });
}
export function afterEach(fn) {
  return window.afterEach(function() {
    var _this = this;
    Ember.run(function() {
      fn.call(_this);
    });
  });
}
export var sinon = window.sinon;
