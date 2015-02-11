import { describe, it, beforeEach } from '../../test-helper';
import Input from 'ember-input';

describe('Input', function() {
  var input;
  describe("with no validations at all", function() {
    beforeEach(function() {
      input = Input.extend({}).create();
      input.get('validator.isFulfilled');
    });

    it("is valid", function() {
      expect(input.get('validator.isSettled')).to.equal(true);
      expect(input.get('validator.isFulfilled')).to.equal(true);
      expect(input.get('validator.isRejected')).to.equal(false);
    });

    describe("pushing any kind of nonsense into its source", function() {
      beforeEach(function() {
        input.set('source', 'xyz%^((()))');
      });
      it("remains valid", function() {
        expect(input.get('validator.isFulfilled')).to.equal(true);
      });
    });

  });

  describe("with a simple validation", function() {
    beforeEach(function() {
      input = Input.extend({
        rules: {
          longEnough: Input.rule('source.length', function() {
            return this.get('source.length') > 3;
          })
        }
      }).create();
      input.get('validator.isFulfilled');
    });
    it("starts of as invalid", function() {
      expect(input.get('validator.isFulfilled')).to.equal(false);
      expect(input.get('validator.isRejected')).to.equal(true);
    });
    describe("updating the input", function() {
      beforeEach(function() {
        input.set('source', 'football');
        expect(input.get('validator.isSettled'));
      });
      it("becomes valid", function() {
        expect(input.get('validator.isFulfilled')).to.equal(true);
      });
    });

  });
  describe("with an asynchronous validation", function() {

  });

  describe("with multiple atomic fields", function() {

  });
  describe("with a validation that has dependencies", function() {

  });

});
