/*jshint expr: true*/
import { describe, it, beforeEach, afterEach, sinon } from '../../test-helper';
import Ember from 'ember';
import Input from 'ember-input';

describe('Input', function() {
  var input;

  function isFulfilled() {
    return input.get('validator.isFulfilled');
  }
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

      Ember.addObserver(input, 'validator.isFulfilled', isFulfilled);
      isFulfilled();
    });
    afterEach(function() {
      Ember.removeObserver(input, 'validator.isFulfilled', isFulfilled);
    });
    it("starts of as invalid", function() {
      expect(input.get('validator.isFulfilled')).to.equal(false);
      expect(input.get('validator.isRejected')).to.equal(true);
    });
    describe("updating the input", function() {
      beforeEach(function() {
        input.set('source', 'football');
      });
      it("becomes valid", function() {
        expect(isFulfilled()).to.equal(true);
      });
    });

  });

  describe("with an asynchronous validation", function() {
    beforeEach(function() {
      var _this = this;
      var spy = this.spy = sinon.spy(function(resolve, reject) {
        _this.resolve = resolve;
        _this.reject = reject;
      });
      input = Input.extend({
        rules: {
          angusMcAsync: Input.rule('source', function(resolve, reject) {
            return spy(resolve, reject);
          })
        }
      }).create();
      isFulfilled();
    });

    it("is not pending", function() {
      expect(this.spy).to.have.been.called;
      expect(input.get('validator.isPending')).to.equal(true);
    });
    describe("when the promise resolves", function() {
      beforeEach(function() {
        this.resolve();
      });
      it("becomes valid", function() {
        expect(isFulfilled()).to.equal(true);
      });
    });
    describe("when the promise is rejected", function() {
      beforeEach(function() {
        this.reject();
      });
      it("becomes invalid", function() {
        expect(isFulfilled()).to.equal(false);
      });
    });

  });

  describe("with multiple atomic fields", function() {

  });
  describe("with a validation that has dependencies", function() {

  });

});
