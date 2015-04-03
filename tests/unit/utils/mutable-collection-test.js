/*jshint expr: true*/
import Ember from 'ember';
import { describe, it, beforeEach, afterEach, sinon } from '../../test-helper';
import MutableCollection from 'ember-input/utils/mutable-collection';

var expect = window.expect;

var mc;

describe("Mutable Collection", function() {
  beforeEach(function() {
    mc = MutableCollection.create({
      original: Ember.A([1,2,3,4])
    });
  });
  it("starts out looking like the original array", function() {
    expect(toArray()).to.deep.equal([1,2,3,4]);
  });
  describe("removing some things", function() {
    beforeEach(function() {
      mc.setObjects([2,3]);
    });
    it("does not change the original", function() {
      expect(toArray(mc.get('original'))).to.deep.equal([1,2,3,4]);
    });
    it("looks like the new array", function() {
      expect(toArray()).to.deep.equal([2,3]);
    });
    it("contains the list of removed objects", function() {
      expect(toArray(mc.get('removing'))).to.deep.equal([1,4]);
    });
  });

});

/**
 * convert an array to a native array to make deep.equal work
 * correctly. If no `enumerable` provided it calls it on the
 * collection.
 */
function toArray(enumerable) {
  enumerable = enumerable || mc;
  const native = [];
  enumerable.forEach(function(item) {
    native.push(item);
  });
  return native;
}
