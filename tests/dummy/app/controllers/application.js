import Ember from 'ember';
import CreditCardForm from 'dummy/forms/credit-card';

export default Ember.ObjectController.extend({
  form: Ember.computed.reads('formObject.scope'),
  validation: Ember.computed.reads('formObject.validation'),
  progress: Ember.computed.reads('formObject.progress'),
  formObject: Ember.computed(function() {
    return CreditCardForm.create();
  })
});
