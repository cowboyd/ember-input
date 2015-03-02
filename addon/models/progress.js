import Ember from 'ember';

function groupBy(filter) {
  return Ember.computed('rules', function() {
    return ProgressGroup.extend({
      content: Ember.computed.filterBy('rules', filter, true)
    }).create({
      rules: this.get('rules')
    });
  });
}

export default Ember.Object.extend({
  pending: groupBy('isPending'),
  settled: groupBy('isSettled'),
  rejected: groupBy('isRejected'),
  fulfilled: groupBy('isFulfilled')
});

var ProgressGroup = Ember.ArrayProxy.extend({
  ratio: Ember.computed('length', 'rules.length', function() {
    return this.get('length') / this.get('rules.length');
  }),
  percentage: Ember.computed('ratio', function() {
    return this.get('ratio') * 100;
  })
});
