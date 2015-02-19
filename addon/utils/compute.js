import Ember from 'ember';

export function compute(dependentKeys, fn) {
  return Ember.computed.apply(Ember, dependentKeys.concat([fn]));
}

export function readOnly(key) {
  return Ember.computed.readOnly(key);
}
