import Ember from 'ember';
import Form from 'ember-input/models/form';

export default Ember.Component.extend({
  propertyBindings: ['value > _formObject.value'],
  tagName: 'form',

  _formObject: Ember.computed('type', function() {
    var type = this.get('type');
    var Type;
    if (!!type) {
      Type = this.container.lookupFactory('form:' + type);
    } else {
      Type = Form;
    }
    return Type.create();
  }),

  willDestroyElement() {
    this.get('_formObject').destroy();
    this._super.apply(arguments);
  }
});
