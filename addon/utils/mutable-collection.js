import Ember from 'ember';

/**
 * Presents a mutable interface to an immutable array.
 *
 * As you make changes to the array, it tracks which objects are new,
 * which objects have been removed, and which objects were in the
 * original array. To use an instance of this class, set the
 * `original` property to an array. This array will not be touched as
 * you make changes via the mutable interface. E.g.
 *
 *   var list = MutableCollection.create({
 *     original: ['H2O', 'CO2', 'CH4']
 *   });
 *   list; //=> ['H2O', 'CO2', 'CH4']
 *   list.get('adding');  //=> []
 *   list.get('removing'); //=> []
 *   list.get('enduring'); //=> ['H2O', 'CO2', 'CH4']
 *
 *   //make some changes
 *
 *   list.popObject(); //=> 'CH4'
 *   list.shiftObject(); //=> 'H20'
 *   list.pushObject('C2H6O'); //=> 'C2H60'
 *   list.unshiftObject('N20'); //=> 'N2O'
 *
 *   list; //=> ['N2O', 'CO2', 'C2H6O']
 *   list.get('adding'); //=> ['N2O', 'C2H6O']
 *   list.get('removing'); //=> ['H2O', 'CH4']
 *   list.get('enduring'); //=> ['CO2']
 *   list.get('original'); //=> ['H2O', 'CO2', 'CH4']
 */


export default Ember.ArrayProxy.extend({

  /**
   * Any time the original changes, take a snapshot.
   */
  content: Ember.computed.map('original', function(item) {
    return item;
  }),

  /**
   * all the objects that are in content, but not in the original
   */
  adding: Ember.computed.setDiff('content', 'original'),

  /**
   * all the objects that are in original, but not the content
   */
  removing: Ember.computed.setDiff('original', 'content'),

  /**
   * all object that were in original, and remain in content
   */
  enduring: Ember.computed.intersect('original', 'content')
});
