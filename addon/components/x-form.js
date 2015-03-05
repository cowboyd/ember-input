import Ember from 'ember';
import Form from 'ember-input/models/form';

export default Ember.Component.extend({
  propertyBindings: ['value > form.value'],
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

  _teardown: Ember.observer(function() {
    this.get('_formObject').destroy();
  }).on('willDestroyElement')
});
