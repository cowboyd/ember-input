import { describe, it, beforeEach } from '../../test-helper';
import Input from 'ember-input';

describe('Input', function() {
  describe("with no validations at all", function() {
    beforeEach(function() {
      this.input = Input.extend({}).create();
    });

    it("is valid", function() {
      expect(this.input.get('_validation.isOk')).to.equal(true);
      expect(this.input.get('_validation.notOk')).to.equal(false);
    });

    describe("pushing any kind of nonsense into its source", function() {
      beforeEach(function() {
        this.input.set('source', 'xyz%^((()))');
      });
      it("remains valid", function() {
        expect(this.input.get('_validation.isOk')).to.equal(true);
      });
    });

  });

  describe("with a simple validation", function() {
    beforeEach(function() {
      this.input = Input.extend({
        validations: {
          longEnough: Input.validation('source.length', function() {
            return this.get('source.length') > 3;
          })
        }
      }).create();
    });
    it("starts of as invalid", function() {

    });
  });
  describe("with an asynchronous validation", function() {

  });

  describe("with multiple atomic fields", function() {

  });
  describe("with a validation that has dependencies", function() {

  });

});
