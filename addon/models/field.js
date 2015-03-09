import Ember from 'ember';

export default Ember.Object.extend({
  propertyBindings: ['formattedValue > templatingContext', 'unformattedValue > value'],

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
  unformattedValue: Ember.computed('templatingContext', function() {
    return this.unformat(this.get('templatingContext'));
  })
});
