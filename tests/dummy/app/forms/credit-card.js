import Form from 'ember-input';
import CreditCardNumber from 'dummy/forms/credit-card-number';

export default Form.extend({
  number: Form.hasOne(CreditCardNumber),
  type: Form.reads('number.type')
});
