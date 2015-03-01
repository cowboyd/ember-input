import Ember from 'ember';
import { RSVP, makePromiseObject } from '../utils/make-promise';

export var RuleSet = Ember.Object.extend({
  _form: null,
  definition: {},
  result: Ember.computed('rules.@each.isPending', function() {
    return makePromiseObject(RSVP.all(this.get('rules').mapBy('result')));
  }),
  ruleNames: Ember.computed('definition', function() {
    return Object.keys(this.get('definition'));
  }),
  rules: Ember.computed.map('ruleNames', function(ruleName) {
    var Rule = Ember.Object.extend({
      _form: this.get('_form'),
      name: ruleName,
      result: this.get('definition')[ruleName],
      isPending: Ember.computed.reads('result.isPending')
    });
    return Rule.create();
  })
});

export var Rule = Ember.Object.extend({
  _form: Ember.computed.reads('form'),
  form: Ember.required(),
  name: Ember.required(),
  result: Ember.required()
});