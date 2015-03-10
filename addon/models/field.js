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
    var formatted = this.format(buffer);
    if (formatted !== this.format(this.unformat(formatted))) {
      throw new Error('unstable format. ' + formatted + ' !=  ' + this.format(this.unformat(formatted)));
    }
    return formatted;
  }),

  validatedBuffer: Ember.computed('validation.isFulfilled', function() {
    if (this.get('validation.isFulfilled')) {
      return this.get('buffer');
    } else {
      return this.get('value');
    }
  }),

  unformattedInput: Ember.computed('input', function() {
    var unformatted = this.unformat(this.get('input'));
    var inverted = this.unformat(this.format(unformatted));
    if (unformatted !== inverted && !(isNaN(unformatted) && isNaN(inverted))) {
      throw new Error('unstable parse. "' + unformatted + '" != "' + this.unformat(this.format(unformatted)) + '"');
    }
    return unformatted;
  }).readOnly()
});
