import Ember from 'ember';
import Form from 'ember-input/models/form';
import { bindProperties } from 'ember-binding-macros/mixins/property-bindings';
import PropertyBindings from 'ember-binding-macros/mixins/property-bindings';

export default Ember.Component.extend(PropertyBindings, {
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

  init: function() {
    this._super.apply(this, arguments);
    const boundAttributes = this.get('_formObject').get('formAttributeBindings') || [];
    boundAttributes.forEach(function(attr) {
      bindProperties(this, attr, '_formObject.' + attr, true);
    }, this);
  },

  willDestroyElement() {
    this.get('_formObject').destroy();
    this._super.apply(arguments);
  }
});
