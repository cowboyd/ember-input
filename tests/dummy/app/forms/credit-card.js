import Form from 'ember-input';

export default Form.extend({
  number: Form.hasOne('credit-card-number'),
  exp: Form.hasOne('credit-card-exp'),
  type: Form.reads('number.type')
});
