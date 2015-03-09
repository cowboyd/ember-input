import Ember from 'ember';
import RuleSet from './rule';
import Validation from './validation';
import Progress from './progress';

export default Ember.Mixin.create({
  rules: {},
  children: [],
  ruleSet: Ember.computed('rules', function() {
    return RuleSet.for(this, this.get('rules'));
  }).readOnly(),

  validation: Ember.computed('ruleSet', '_childKeys', function() {
    var form = this;
    var children = this.get('_childKeys').reduce(function(children, key) {
      children[key] = form.get(key).get('validation');
      return children;
    }, {});
    return Validation.create(children, {
      _ruleSet: this.get('ruleSet')
    });
  }).readOnly(),

  progress: Ember.computed('ruleSet.all', function() {
    var form = this;
    var children = this.get('_childKeys').reduce(function(children, key) {
      children[key] = form.get(key).get('progress');
      return children;

    }, {});
    return Progress.create(children, {
      rules: this.get('ruleSet.all'),
      self: Progress.create({
        rules: this.get('ruleSet.rules')
      })
    });
  })
});
