import Ember from 'ember';

var PromiseObject = Ember.Object.extend(Ember.PromiseProxyMixin);

export var RSVP = Ember.RSVP;

export function makePromiseObject(promise) {
  var object = PromiseObject.create();
  object.set('promise', promise);
  return object;
}

export function makePromise(start) {
  return makePromiseObject(new Ember.RSVP.Promise(start));
}
