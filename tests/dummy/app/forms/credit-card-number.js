import Ember from 'ember';
import Form from 'ember-input';

export default Form.extend({

  format: function(unformatted) {
    unformatted = unformatted || '';
    return [
      unformatted.substring(0,4),
      unformatted.substring(4,8),
      unformatted.substring(8,12),
      unformatted.substring(12,16)
    ].join(' ').trim();
  },

  unformat: function(formatted) {
    if (!!formatted) {
      return formatted.replace(/(\s|[^0-9])/g, '');
    } else {
      return '';
    }
  },

  rules: {
    isLongEnough: Form.rule('scope.length', function() {
      return this.get('scope.length') === 16;
    }),
    passesLuhnCheck: Form.rule('scope', function() {
      var value = this.get('scope');
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
    }).when('isLongEnough'),
    isUnique: Form.rule('scope', function(resolve, reject) {
      setTimeout(resolve, 2000);
    }).when('isLongEnough', 'passesLuhnCheck')
  }
});
