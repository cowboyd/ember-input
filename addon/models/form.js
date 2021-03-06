import Ember from 'ember';
import { rule } from './rule';
import Validatable from './validatable';
import Field from './field';

var Form = Ember.Object.extend(Validatable, {

  templateContext: Ember.computed('value', function() {
    var value = this.get('value');
    var aliases = this.get('_fields').reduce(function(aliases, field) {
      aliases[field.name] = Ember.computed.alias('_form.' + field.name + '.input');
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
    var isEmberObject = Ember.Object.detect(value);
    var serialized = this.get('_fields').reduce(function(values, field) {
      var val;
      if (isEmberObject) {
        val = value.get(field.name);
      } else {
        val = value[field.name];
      }
      if (val != null) {
        values[field.name] = val;
      }
      return values;
    }, {});
    return serialized;
  },

  _fields: Ember.computed(function() {
    var fields = [];
    this.constructor.eachComputedProperty(function(name, meta) {
      if (meta.isForm) {
        meta.name = name;
        fields.push(meta);
      }
    }, this);
    return Ember.A(fields);
  }),

  _readKeys: Ember.computed(function() {
    var readKeys = [];
    this.constructor.eachComputedProperty(function(name, meta) {
      if (!meta.isForm) {
        readKeys.push(name);
      }
    }, this);
    return readKeys;
  }),

  children: Ember.computed.map('_fields', function(desc) {
    return this.get(desc.name);
  }),

  willDestroy: function() {
    this.get('children').forEach(function(child) {
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

export function field(attrs) {
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
      fieldName: property.meta().name
    });
  }).meta({isForm: true});
  return property;
}

Form.field = field;

export default Form;
