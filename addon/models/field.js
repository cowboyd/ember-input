import Ember from 'ember';
import PropertyBindings from 'ember-binding-macros/mixins/property-bindings';
import Validatable from './validatable';

export default Ember.Object.extend(Validatable, PropertyBindings, {
  propertyBindings: ['formattedValue > input', 'unformattedInput > value'],

  value: null,
  input: null,

  format: function(unformatted) {
    return unformatted;
  },
  unformat: function(formatted) {
    return formatted;
  },
  formattedValue: Ember.computed('value', 'format', function() {
    return this.format(this.get('value'));
  }),
  unformattedInput: Ember.computed('validation.isFulfilled', 'input', function() {
    if (this.get('validation.isFulfilled')) {
      return this.unformat(this.get('input'));
    } else {
      return this.get('value');
    }
  }).readOnly()
});
