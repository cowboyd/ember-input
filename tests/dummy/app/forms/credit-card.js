import { Form, field } from 'ember-input';

export default Form.extend({
  number: field('credit-card-number'),
  exp: field('credit-card-exp'),
  type: Form.reads('number.type')
});
