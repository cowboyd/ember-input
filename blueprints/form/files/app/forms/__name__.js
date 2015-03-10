import Ember from 'ember';
import {Form, field, rule } from 'ember-input';

export default Form.extend({

  //form attributes go here.
  //e.g.
  // firstName: field(),
  // lastName: field()

  // validation rules go here. e.g.
  //rules: {
    // hasFullName: rule('firstName.value', 'lastName.value', function() {
    //   var first = this.get('firstName.value');
    //   var last = this.get('lastName.value');
    //   return !Ember.isEmpty(first) && !Ember.isEmpty(last);
    // })
  //}
});
