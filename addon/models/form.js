import Ember from 'ember';
import PropertyBindings from 'ember-binding-macros/mixins/property-bindings';
import { bindProperties } from 'ember-binding-macros/mixins/property-bindings';
import { readOnly } from '../utils/compute';
import { makePromise } from '../utils/make-promise';
import { RuleSet } from './rule';
import Progress from './progress';

var a_slice = [].slice;

var Form = Ember.Object.extend(PropertyBindings, {
  propertyBindings: ['transformedValue > value', 'currentScope > scope', 'scope <> input'],

  rules: {},
  currentScope: Ember.computed('value', '_parentForm.currentScope', function() {
    return this.serialize(this.get('value'));
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


  serialize: function(value) {
    if (this.get('isAtom')) {
      return value;
    } else {
      var form = this;
      var attrs = this.get('_childKeys').reduce(function(current, key) {
        current[key] = form.get(key).get('value');
        return current;
      }, {});
      this.get('_readKeys').reduce(function(current, key) {
        current[key] = form.get(key);
      }, attrs);
      return Ember.Object.create(attrs);
    }
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

  __bindChildValues__: Ember.observer(function() {
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
    if (childKeys.length > 0) {
      childKeys.forEach(function(key) {
        bindProperties(this, key + ".currentScope", "currentScope." + key);
      }, this);
      readKeys.forEach(function(key) {
        bindProperties(this, key, "currentScope." + key, true).toString();
      }, this);
    }
  }).on('init'),

  willDestroy: function() {
    this.get('_children').forEach(function(child) {
      child.destroy();
    });
    this._super.apply(this, arguments);
  }
});

Form.rule = function(fn) {
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
};

Form.hasOne = function(attrs) {
  attrs = attrs || {};
  return Ember.computed(function() {
    return Form.extend(attrs).create({
      _parentForm: this
    });
  }).meta({isForm: true});
};

Form.reads = function(dependentKey) {
  return Ember.computed(dependentKey, function() {
    return this.get(dependentKey);
  }).readOnly().meta({isFormRead: true});
};

var Validation = Ember.Object.extend({
  isPending: readOnly('_ruleSet.result.isPending'),
  isSettled: readOnly('_ruleSet.result.isSettled'),
  isRejected: readOnly('_ruleSet.result.isRejected'),
  isFulfilled: readOnly('_ruleSet.result.isFulfilled'),
  rules: Ember.computed('_ruleSet', function() {
    var rules = this.get('_ruleSet.rules');
    return rules.reduce(function(rollup, rule) {
      rollup.set(rule.get('name'), rule);
      return rollup;
    }, Ember.ArrayProxy.extend({
      content: rules
    }).create());
  })
});

export default Form;
