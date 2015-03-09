import Ember from 'ember';
import Validatable from './validatable';

export default Ember.Object.extend(Validatable, {
  propertyBindings: ['formattedValue > input', 'unformattedValue > value'],

  templatingContext: null,

  format: function(unformatted) {
    return unformatted;
  },
  unformat: function(formatted) {
    return formatted;
  },
  formattedValue: Ember.computed('value', 'format', function() {
    return this.format(this.get('value'));
  }),
  unformattedValue: Ember.computed('templatingContext', 'unformat', function() {
    return this.unformat(this.get('templatingContext'));
  })
});
