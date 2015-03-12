import Ember from 'ember';
import { Field, rule } from 'ember-input';

export default Field.extend({

  format: function(buffer) {
    return (buffer || '').replace(/[^0-9]\//g, '');
  },

  structure: Ember.computed('buffer', function() {
    var buffer = this.get('buffer');
    var stripped = (buffer || '').replace(/\s/g, '').replace(/[^0-9\/]/g, '');
    var split = stripped.split('/');

    if (split.length > 1) {
      return {
        month: parseInt(split[0].substring(0,2)),
        year: parseInt(split[1].substring(0,2))
      };
    } else if (split[0].length > 0) {
      return {
        month: parseInt(split[0].substring(0,2))
      };
    } else {
      return {};
    }
  }),

  rules: {
    isValidMonth: rule('buffer', function() {
      var buffer = this.get('buffer');
      return buffer.month && buffer.month > 1 && buffer.month <= 12;
    }),
    isValidYear: rule('buffer', function() {
      var buffer = this.get('buffer');
      return buffer.year >= (new Date().getFullYear() - 2000);
    })
  }
});
