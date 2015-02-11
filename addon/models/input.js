import Ember from 'ember';

var RSVP = Ember.RSVP;
var a_slice = [].slice;

function computed(dependentKeys, fn) {
  return Ember.computed.apply(Ember, dependentKeys.concat([fn]));
}

function readOnly(key) {
  return Ember.computed.readOnly(key);
}

function createPromiseObject(promise) {
  var object = PromiseObject.create();
  object.set('promise', promise);
  return object;
}

var PromiseObject = Ember.Object.extend(Ember.PromiseProxyMixin);

function promise(start) {
  return createPromiseObject(new Ember.RSVP.Promise(start));
}

var Input = Ember.Object.extend({
  rules: {},
  validator: Ember.computed('rules', function() {
    var rules = this.get('rules');
    var keys = Object.keys(rules);

    return Validator.extend(rules, {
      input: this,
      validation: computed(keys, function() {
        return createPromiseObject(RSVP.hash(this.getProperties(keys)));
      }).readOnly()
    }).create();
  }).readOnly()
});

Input.rule = function(fn) {
  var args;
  if (arguments.length > 1) {
    args = a_slice.call(arguments);
    fn = args.pop();
    args = args.map(function(key) {
      return "input." + key;
    });
  }

  args.push(function thunk() {
    var input = this.get('input');
    return promise(function(resolve, reject) {
      if (fn.call(input)) {
        resolve();
      } else {
        reject();
      }
    });
  });

  return Ember.computed.apply(Ember, args);
};

var Validator = Ember.Object.extend({
  input: Ember.required(),
  isPending: readOnly('validation.isPending'),
  isSettled: readOnly('validation.isSettled'),
  isRejected: readOnly('validation.isRejected'),
  isFulfilled: readOnly('validation.isFulfilled')
});

export default Input;
