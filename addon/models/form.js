import Ember from 'ember';
import PropertyBindings from 'ember-binding-macros/mixins/property-bindings';
import { rule } from './rule';
import Validatable from './validatable';
import Field from './field';

var Form = Ember.Object.extend(PropertyBindings, Validatable, {
  propertyBindings: [],

  templateContext: Ember.computed('value', function() {
    var value = this.get('value');
    var aliases = this.get('_childKeys').reduce(function(aliases, key) {
      aliases[key] = Ember.computed.alias('_form.' + key + '.input');
      return aliases;
    }, {});
    var reads = this.get('_readKeys').reduce(function(reads, key) {
      reads[key] = Ember.computed.reads("_form." + key);
      return reads;
    }, {});
    var Context = Ember.Object.extend(aliases, reads, {
      _form: this
    });
    return Context.create(this.serialize(value || {}));
  }),

  serialize: function(value) {
    return value;
  },

  _fields: Ember.computed(function() {
    var fields = [];
    this.constructor.eachComputedProperty(function(name, meta) {
      if (meta.isForm) {
        meta.name = name;
        fields.push(meta);
      }
    }, this);
    return fields;
  }),

  _readKeys: Ember.computed(function() {
    var readKeys = [];
    this.constructor.eachComputedProperty(function(name, meta) {
      if (meta.isFormRead) {
        readKeys.push(name);
      }
    }, this);
    return readKeys;
  }),

  _childKeys: Ember.computed.mapBy('_fields', 'name'),

  _children: Ember.computed.map('_childKeys', function(key) {
    return this.get(key);
  }),

  children: Ember.computed.reads('_children'),

  willDestroy: function() {
    this.get('_children').forEach(function(child) {
      child.destroy();
    });
    this._super.apply(this, arguments);
  }
});

Form.rule = rule;

Form.hasOne = function(attrs) {
  var property = Ember.computed(function() {
    attrs = attrs || {};
    var Type;
    if (typeof attrs === 'string') {
      Type = this.container.lookupFactory('form:' + attrs);
    } else if (Form.detect(attrs)) {
      Type = attrs;
    } else {
      Type = Form.extend(attrs);
    }
    return Type.create({
      _parentForm: this,
      fieldName: property.meta().name
    });
  }).meta({isForm: true});
  return property;
};

Form.reads = function(dependentKey) {
  return Ember.computed(dependentKey, function() {
    return this.get(dependentKey);
  }).readOnly().meta({isFormRead: true});
};

Form.field = function(attrs) {
  var property = Ember.computed(function() {
    attrs = attrs || {};
    var Type;
    if (typeof attrs === 'string') {
      Type = this.container.lookupFactory('field:' + attrs);
    } else if (Field.detect(attrs)) {
      Type = attrs;
    } else {
      Type = Field.extend(attrs);
    }
    return Type.create({
      parent: this,
      fieldName: property.meta().name
    });
  }).meta({isForm: true});
  return property;
};

export default Form;
