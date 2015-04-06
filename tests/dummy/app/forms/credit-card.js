import Ember from 'ember';
import { Form, field } from 'ember-input';

export default Form.extend({
  formAttributeBindings: ['quotation'],

  funQuote: Ember.computed('quotation', function() {
    return this.get('quotation');
  }),

  number: field('credit-card-number'),
  exp: field('credit-card-exp'),
  type: Form.reads('number.type')
});
