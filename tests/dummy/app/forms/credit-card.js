import Form from 'ember-input';

export default Form.extend({
  number: Form.hasOne('credit-card-number'),
  type: Form.reads('number.type')
});
