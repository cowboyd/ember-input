import Ember from 'ember';
import PropertyBindings from 'ember-binding-macros/mixins/property-bindings';
import { bindProperties } from 'ember-binding-macros/mixins/property-bindings';
import { compute, readOnly } from '../utils/compute';
import { RSVP, makePromise, makePromiseObject } from '../utils/make-promise';

var a_slice = [].slice;

var Form = Ember.Object.extend(PropertyBindings, {
  propertyBindings: ['transformedValue > value', 'currentScope > scope', 'scope <> input'],

  rules: {},
  currentScope: Ember.computed('value', '_parentForm.currentScope', function() {
    return this.serialize(this.get('value'));
  }),
  isAtom: Ember.computed.equal('_children.length', 0),

  transform: function(input) {
    console.log('transform');
    return input;
  },

  transformedValue: Ember.computed('validator.isFulfilled', function() {
    if (this.get('validator.isFulfilled')) {
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
        console.log(key, form.get(key).get('value'), form.get(key).get('input'));
        return current;
      }, {});
      console.log('attrs', attrs);
      return Ember.Object.create(attrs);
    }
  },

  validator: Ember.computed('rules', '_children.@each.validator', function() {
    var rules = this.get('rules');
    var keys = Object.keys(rules);
    var dependentKeys = keys.concat('validators.@each.isPending');

    return Validator.extend(rules, {
      form: this,

      validators: this.get('_children').mapBy('validator'),

      result: compute(dependentKeys, function() {
        var properties = this.getProperties(keys);
        var form = this.get('form');
        var children = form.get('_childKeys').reduce(function(hash, key) {
          hash[key] = form.get(key).get('validator.result');
          return hash;
        }, {});

        Ember.merge(properties, {
          _children: RSVP.hash(children)
        });
        var promise = makePromiseObject(RSVP.hash(properties));
        console.log('promise', promise.get('promise'));
        return promise;
      }).readOnly()
    }).create();
  }).readOnly(),

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
    if (childKeys.length > 0) {
      childKeys.forEach(function(key) {
        bindProperties(this, key + ".currentScope", "currentScope." + key, true);
      }, this);
      readKeys.forEach(function(key) {
        bindProperties(this, key, "scope." + key, true);
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

var Validator = Ember.Object.extend({
  isPending: readOnly('result.isPending'),
  isSettled: readOnly('result.isSettled'),
  isRejected: readOnly('result.isRejected'),
  isFulfilled: readOnly('result.isFulfilled')
});

export default Form;
