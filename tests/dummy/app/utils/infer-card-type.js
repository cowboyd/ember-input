import Ember from 'ember';

var VISA_REGEX = /^4/;
var MASTERCARD_REGEX = /^5[1-5]/;
var AMEX_REGEX = /^3[47]/;
var DISCOVER_REGEX = /^6(?:011|5)/;
var DINERS_CLUB_REGEX = /^3(?:0[0-5]|[68])/;
var JCB_REGEX = /^(?:2131|1800|35)/;

export default function inferCardType(number) {
  if (number.match(VISA_REGEX)) {return "visa";}
  else if (number.match(MASTERCARD_REGEX)) {return "mastercard";}
  else if (number.match(AMEX_REGEX)) {return "amex";}
  else if (number.match(DISCOVER_REGEX)) {return "discover";}
  else if (number.match(DINERS_CLUB_REGEX)) {return "diners";}
  else if (number.match(JCB_REGEX)) {return "jcb";}
  else {return Ember.undefined;}
}
