import Ember from 'ember';
import CreditCardForm from 'dummy/forms/credit-card';

export default Ember.ObjectController.extend({
  form: Ember.computed.reads('formObject.source'),
  validation: Ember.computed.reads('formObject'),
  formObject: Ember.computed(function() {
    return CreditCardForm.create();
  })
});
