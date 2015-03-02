import Ember from 'ember';
import { RSVP, makePromiseObject } from '../utils/make-promise';

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
      result: this.get('definition')[ruleName]
    });
    return Rule.create();
  }),
  children: Ember.computed.mapBy('form._children', 'ruleSet')
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
