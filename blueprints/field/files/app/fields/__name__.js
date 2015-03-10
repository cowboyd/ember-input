import Ember from 'ember';
import { Field, rule } from 'ember-input';

export default Field.extend({

  /**
   * Formats the field's buffer for display. The buffer will contain a
   * structure similar to the `value` property, but the only
   * difference is that it may be incomplete or otherwise invalid.
   *
   * This operation must be the logical inverse of `unformat`. In
   * other words, if unformat(format(unformat())) != unformat(), then
   * behavior is undefined.
   */
  format: function(buffer) {
    return buffer;
  },

  /**
   * Parse raw input into this field's buffer. This should come as
   * close to returning an object suitable to be the field's value as
   * possible.
   *
   * The contents of this parsed buffer will become the field's value
   * when it passes all validations. This operation *must* be the
   * logical inverse of `format()`. In other words, if
   * format(unformat(format())) !== format(), then behavior is
   * undefined.
   */
  unformat: function(input) {
    return input;
  },

  //place any rules for this field here.
  rules: {
    //e.g.
    //notEmpty: rule('buffer', function() {
    //  return !Ember.isEmpty(this.get('buffer'));
    //})
  }
});
