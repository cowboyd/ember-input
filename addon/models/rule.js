import Ember from 'ember';
import { RSVP, makePromise, makePromiseObject } from '../utils/make-promise';

var a_slice = [].slice;

export var RuleSet = Ember.Object.extend({
  form: null,
  definition: {},
  result: Ember.computed('rules.@each.result', 'children.@each.result', function() {
    return makePromiseObject(RSVP.hash({
      self: RSVP.all(this.get('rules').mapBy('result')),
      children: RSVP.all(this.get('children').mapBy('result'))
    }));
  }),
  ruleNames: Ember.computed('definition', function() {
    return Object.keys(this.get('definition'));
  }),
  rules: Ember.computed.map('ruleNames', function(ruleName) {
    var Rule = Ember.Object.extend({
      form: this.get('form'),
      name: ruleName,
      result: this.get('definition')[ruleName],
      isPending: Ember.computed.reads('result.isPending'),
      isSettled: Ember.computed.reads('result.isSettled'),
      isRejected: Ember.computed.reads('result.isRejected'),
      isFulfilled: Ember.computed.reads('result.isFulfilled')
    });
    return Rule.create();
  }),
  children: Ember.computed.mapBy('form._children', 'ruleSet'),
  all: Ember.computed('children.[]', function() {
    return this.get('children').reduce(function(rules, child) {
      return rules.concat(child.get('all'));
    }, this.get('rules'));
  })
});

export var EmptyRuleSet = RuleSet.extend({
  result: Ember.computed('form.scope', function() {
    return makePromiseObject(RSVP.resolve());
  })
});

RuleSet.for = function(form, definition) {
  if (Ember.isEmpty(Object.keys(definition)) && Ember.isEmpty(form.get('_children'))) {
    return EmptyRuleSet.create({form: form, definition: definition});
  } else {
    return RuleSet.create({form: form, definition: definition});
  }
};

export function rule(fn) {
  var args;
  if (arguments.length > 1) {
    args = a_slice.call(arguments);
    fn = args.pop();
    args = args.map(function(key) {
      return "form." + key;
    });
  }

  args.push(function thunk() {
    var form = this.get('form');
    return makePromise(function(resolve, reject) {
      if (fn.length === 2) {
        fn.call(form, resolve, reject);
      } else if (fn.length === 0){
        if (fn.call(form)) {
          resolve();
        } else {
          reject();
        }
      } else {
        Ember.assert("Form.rule should be called with either 0 or 2 arguments", false);
      }
    });
  });

  return Ember.computed.apply(Ember, args);
}
