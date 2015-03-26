/*jshint expr: true*/
import { describe, it, beforeEach, afterEach, sinon } from '../../test-helper';
import MutableCollection from 'ember-input/utils/mutable-collection';

var expect = window.expect;

var mc;
describe("Mutable Collection", function() {
  beforeEach(function() {
    mc = MutableCollection.create({
      original: [1,2,3,4]
    });
  });
  it("starts out looking like the original array", function() {
    expect(mc.toArray()).to.deep.equal([1,2,3,4]);
  });
  describe("removing some things", function() {
    beforeEach(function() {
      mc.setObjects([2,3]);
    });
    it("does not change the original", function() {
      expect(mc.get('original')).to.deep.equal([1,2,3,4]);
    });
    it("looks like the new array", function() {
      expect(mc.toArray()).to.deep.equal([2,3]);
    });
    it("contains the list of removed objects", function() {
      expect(mc.get('removing')).to.deep.equal([1,4]);
    });
  });

});
