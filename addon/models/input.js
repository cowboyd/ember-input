import Ember from 'ember';
import PropertyBindings from 'ember-binding-macros/mixins/property-bindings';
import { bindProperties } from 'ember-binding-macros/mixins/property-bindings';

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

var Input = Ember.Object.extend(PropertyBindings, {
  propertyBindings: ['transformedValue > output', 'formattedValue > source'],
  rules: {},
  source: "",
  transform: function(source) {
    return source;
  },
  transformedValue: Ember.computed('validator.isFulfilled', 'source', function() {
    if (this.get('validator.isFulfilled')) {
      return this.transform(this.get('source'));
    } else {
      return this.get('output');
    }
  }).readOnly(),
  format: function() {
    return this.get('source');
  },
  formattedValue: Ember.computed('output', 'format', function() {
    return this.get('format').call(this, this.get('output'));
  }),

  validator: Ember.computed('rules', '_children.@each.validator', function() {
    var rules = this.get('rules');
    var keys = Object.keys(rules);
    var dependentKeys = keys.concat('validators.@each.isPending');

    return Validator.extend(rules, {
      input: this,

      validators: this.get('_children').mapBy('validator'),

      validation: computed(dependentKeys, function() {
        var properties = this.getProperties(keys);
        var input = this.get('input');
        var children = input.get('_childKeys').reduce(function(hash, key) {
          hash[key] = input.get(key).get('validator.validation');
          return hash;
        }, {});

        Ember.merge(properties, {
          _children: RSVP.hash(children)
        });
        return createPromiseObject(RSVP.hash(properties));
      }).readOnly()
    }).create();
  }).readOnly(),

  __bindChildValues__: Ember.observer(function() {
    var childKeys = [];
    var children = [];
    var readKeys = [];
    this.constructor.eachComputedProperty(function(name, meta) {
      if (meta.isInput) {
        childKeys.push(name);
        children.push(this.get(name));
      } else if (meta.isInputRead) {
        readKeys.push(name);
      }
    }, this);
    if (childKeys.length > 0) {
      this.set('source', Ember.Object.create());
      childKeys.forEach(function(key) {
        bindProperties(this, key + ".source", "source." + key);
      }, this);
      readKeys.forEach(function(key) {
        bindProperties(this, key, "source." + key);
      }, this);
    }
    this.set('_children', Ember.A(children));
    this.set('_childKeys', Ember.A(childKeys));
  }).on('init'),

  willDestroy: function() {
    this.get('_children').forEach(function(child) {
      child.destroy();
    });
    this._super.apply(this, arguments);
  }
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
      if (fn.length === 2) {
        fn.call(input, resolve, reject);
      } else if (fn.length === 0){
        if (fn.call(input)) {
          resolve();
        } else {
          reject();
        }
      } else {
        Ember.assert("Input.rule should be called with either 0 or 2 arguments", false);
      }
    });
  });

  return Ember.computed.apply(Ember, args);
};

Input.hasOne = function(attrs) {
  attrs = attrs || {};
  return Ember.computed(function() {
    return Input.extend(attrs).create();
  }).meta({isInput: true});
};

Input.hasMany = function(attrs) {
  attrs = attrs || {};
  return Ember.computed(function() {
    return InputList.create({
      inputClass: Input.extend(attrs)
    });
  }).readOnly().meta({isInput: true});
};

Input.reads = function(dependentKey) {
  return Ember.computed(dependentKey, function() {
    return this.get(dependentKey);
  }).readOnly().meta({isInputRead: true});
};

var InputList = Ember.ArrayProxy.extend({
  inputClass: Input.extend(),
  createObject: function(source) {
    var list = this;
    var input = this.get('inputClass').create({source: source});
    this.pushObject(input);
    input.remove = function() {
      list.removeObject(this);
    };
    return input;
  },
  content: Ember.computed(function() {
    return Ember.A();
  }).readOnly(),
  validators: Ember.computed.mapBy('content', 'validator'),
  validator: Ember.computed(function() {
    var list = this;

    return Validator.extend({
      input: list,
      validators: readOnly('input.validators'),
      validation: Ember.computed('validators.@each.isPending', function() {
        return createPromiseObject(RSVP.all(list.map(function(input) {
          return input.get('validator.validation');
        })));
      })
    }).create();
  })
});

var Validator = Ember.Object.extend({
  input: Ember.required(),
  isPending: readOnly('validation.isPending'),
  isSettled: readOnly('validation.isSettled'),
  isRejected: readOnly('validation.isRejected'),
  isFulfilled: readOnly('validation.isFulfilled')
});

export default Input;
