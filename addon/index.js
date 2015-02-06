import Ember from 'ember';
import Validation from 'ember-input/models/validation';

var a_slice = [].slice;

var Input = Ember.Object.extend({
  _validation: Ember.computed('validations', function() {
    return Validation.create({
      input: this,
      definitions: this.get('validations'),
      isOk: true,
      notOk: false
    });
  })
});


Input.validation = function createValidationConstraint(func) {
  var args;
  if (arguments.length > 1) {
    args = a_slice.call(arguments);
    func = args.pop();
  }
};

export default Input;
