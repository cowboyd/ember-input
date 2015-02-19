import Ember from 'ember';
import Form from 'ember-input';

export default Form.extend({
  transform: function() {
    return this.get('strippedInput');
  },
  format: function() {
    var input = this.get('strippedInput');
    return [
      input.substring(0,4),
      input.substring(4,8),
      input.substring(8,12),
      input.substring(12,16)
    ].join(' ').trim();
  },

  strippedInput: Ember.computed('source', function() {
    return this.get('source').replace(/(\s|[^0-9])/g, '');
  }),

  rules: {
    isLongEnough: Form.rule('strippedInput.length', function() {
      return this.get('strippedInput.length') === 16;
    }),
    passesLuhnCheck: Form.rule('strippedInput', function() {
      var value = this.get('strippedInput');
      // accept only digits, dashes or spaces
      if (/[^0-9-\s]+/.test(value)) {return false;}

      // The Luhn Algorithm. It's so pretty.
      var nCheck = 0, nDigit = 0, bEven = false;
      value = value.replace(/\D/g, "");

      for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n);
        nDigit = parseInt(cDigit, 10);

        if (bEven) {
          if ((nDigit *= 2) > 9) {nDigit -= 9;}
        }

        nCheck += nDigit;
        bEven = !bEven;
      }
      return (nCheck % 10) === 0;
    }),
    isUnique: Form.rule('strippedInput', function(resolve, reject) {
      setTimeout(function() {
      }, 4000);
    }).onlyIf('isLongEnough')
  }
});
