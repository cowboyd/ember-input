import Ember from 'ember';
import PropertyBindings from 'ember-binding-macros/mixins/property-bindings';
import Validatable from './validatable';

export default Ember.Object.extend(Validatable, PropertyBindings, {
  propertyBindings: ['unformattedInput > buffer', 'value > buffer', 'formattedBuffer > input', 'validatedBuffer > value'],

  value: null,
  buffer: null,
  input: null,

  format: function(unformatted) {
    return unformatted;
  },

  unformat: function(formatted) {
    return formatted;
  },

  formattedBuffer: Ember.computed('buffer', 'format', function() {
    var buffer = this.get('buffer');
    return this.format(buffer);
  }),

  validatedBuffer: Ember.computed('validation.isFulfilled', function() {
    if (this.get('validation.isFulfilled')) {
      return this.get('buffer');
    } else {
      return this.get('value');
    }
  }),

  unformattedInput: Ember.computed('input', function() {
    return this.unformat(this.get('input'));
  }).readOnly()
});
