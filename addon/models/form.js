import Ember from 'ember';
import PropertyBindings from 'ember-binding-macros/mixins/property-bindings';
import { RuleSet, rule } from './rule';
import Progress from './progress';
import Validation from './validation';

var Form = Ember.Object.extend(PropertyBindings, {
  propertyBindings: ['transformedValue > value', 'unformattedInput > scope', 'currentScope > scope', 'formattedInput > input'],

  rules: {},

  currentScope: Ember.computed('value', '_parentForm.currentScope', function() {
    var value = this.get('value');
    if (this.get('isAtom')) {
      return this.serialize(value);
    } else {
      var aliases = this.get('_childKeys').reduce(function(aliases, key) {
        aliases[key] = Ember.computed.alias('_form.' + key + '.input');
        return aliases;
      }, {});
      var reads = this.get('_readKeys').reduce(function(reads, key) {
        reads[key] = Ember.computed.reads("_form." + key);
        return reads;
      }, {});
      var Scope = Ember.Object.extend(aliases, reads, {
        _form: this
      });
      return Scope.create(this.serialize(value || {}));
    }
  }),

  isAtom: Ember.computed.equal('_children.length', 0),

  transform: function(input) {
    return input;
  },

  transformedValue: Ember.computed('validation.isFulfilled', function() {
    if (this.get('validation.isFulfilled')) {
      return this.transform(this.get('scope'));
    } else {
      return this.get('value');
    }
  }).readOnly(),

  format: function(unformatted) {
    return unformatted;
  },

  unformat: function(formatted) {
    return formatted;
  },

  formattedInput: Ember.computed('scope', function() {
    return this.format(this.get('scope'));
  }),

  unformattedInput: Ember.computed('input', function() {
    return this.unformat(this.get('input'));
  }),

  serialize: function(value) {
    return value;
  },

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
  }),

  __collectMetadata__: Ember.observer(function() {
    var childKeys = [];
    var children = [];
    var readKeys = [];
    this.constructor.eachComputedProperty(function(name, meta) {
      if (meta.isForm) {
        childKeys.push(name);
        children.push(this.get(name));
      } else if (meta.isFormRead) {
        readKeys.push(name);
      }
    }, this);
    this.set('_children', Ember.A(children));
    this.set('_childKeys', Ember.A(childKeys));
    this.set('_readKeys', Ember.A(readKeys));
  }).on('init'),

  willDestroy: function() {
    this.get('_children').forEach(function(child) {
      child.destroy();
    });
    this._super.apply(this, arguments);
  }
});

Form.rule = rule;

Form.hasOne = function(attrs) {
  attrs = attrs || {};
  return Ember.computed(function() {
    var Child;
    if (Form.detect(attrs)) {
      Child = attrs;
    } else {
      Child = Form.extend(attrs);
    }
    return Child.create({
      _parentForm: this
    });
  }).meta({isForm: true});
};

Form.reads = function(dependentKey) {
  return Ember.computed(dependentKey, function() {
    return this.get(dependentKey);
  }).readOnly().meta({isFormRead: true});
};

export default Form;
