import Ember from 'ember';
import Form from 'ember-input';
import inferCardType from '../utils/infer-card-type';

export default Form.extend({

  format: function(unformatted) {
    var num = unformatted || '';
    if (this.get("type") === "amex") {
      return [num.substring(0,4), num.substring(4,10), num.substring(10,15)].join(" ").trim();
    } else {
      // Visa etc format like XXXX XXXX XXXX XXXX
      return [num.substring(0,4), num.substring(4,8), num.substring(8,12), num.substring(12,16)].join(" ").trim();
    }
  },

  unformat: function(formatted) {
    if (!!formatted) {
      return formatted.replace(/(\s|[^0-9])/g, '');
    } else {
      return '';
    }
  },

  type: Ember.computed("unformattedInput", function() {
    var input = this.get("unformattedInput") || "";
    return inferCardType(input);
  }),

  rules: {
    isLongEnough: Form.rule('type', 'unformattedInput.length', function() {
      switch(this.get('type')) {
      case 'diners':
      case 'amex':
        return this.get('unformattedInput.length') === 15;
      default:
        return this.get('unformattedInput.length') === 16;
      }
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
    }).when('isLongEnough')
  }
});
