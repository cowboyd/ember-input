import Ember from 'ember';
import { readOnly } from '../utils/compute';

export default Ember.Object.extend({
  isPending: readOnly('_ruleSet.result.isPending'),
  isSettled: readOnly('_ruleSet.result.isSettled'),
  isRejected: readOnly('_ruleSet.result.isRejected'),
  isFulfilled: readOnly('_ruleSet.result.isFulfilled'),
  isNotFulfilled: Ember.computed.not('isFulfilled'),
  rules: Ember.computed('_ruleSet', function() {
    var rules = this.get('_ruleSet.rules');
    return rules.reduce(function(rollup, rule) {
      rollup.set(rule.get('name'), rule);
      return rollup;
    }, Ember.ArrayProxy.extend({
      content: rules
    }).create());
  })
});
