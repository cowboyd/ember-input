/*jshint expr: true*/
import { describe, it, beforeEach, afterEach, sinon } from '../../test-helper';
import Ember from 'ember';
import Field from 'ember-input/models/field';
import { rule } from 'ember-input/models/rule';
import Validatable from 'ember-input/models/validatable';

var expect = window.expect;

describe("Validatable", function() {
  var AlwaysBeValidating;
  var v;
  beforeEach(function() {
    AlwaysBeValidating = Ember.Object.extend(Validatable, {
      consumeValidation: Ember.observer('validation.isFulfilled', function() {
        this.get('validation.isFulfilled');
      }).on('init')
    });
  });

  describe("with no validations at all", function() {
    beforeEach(function() {
      v = AlwaysBeValidating.create();
      v.get('validation.isFulfilled');
    });

    it("is valid", function() {
      expect(v.get('validation.isSettled')).to.equal(true);
      expect(v.get('validation.isFulfilled')).to.equal(true);
      expect(v.get('validation.isRejected')).to.equal(false);
    });

    describe("pushing any kind of nonsense into its input", function() {
      beforeEach(function() {
        v.set('input', 'xyz%^((()))');
      });
      it("remains valid", function() {
        expect(v.get('validation.isFulfilled')).to.equal(true);
      });
    });

  });


  describe("with a simple validation", function() {
    beforeEach(function() {
      v = AlwaysBeValidating.extend({
        rules: {
          longEnough: rule('input.length', function() {
            return this.get('input.length') > 3;
          })
        }
      }).create();
    });
    it("starts of as invalid", function() {
      expect(v.get('validation.isFulfilled')).to.equal(false);
      expect(v.get('validation.isRejected')).to.equal(true);
    });
    describe("updating the input", function() {
      beforeEach(function() {
        v.set('input', 'football');
      });
      it("becomes valid", function() {
        expect(v.get('validation.isFulfilled')).to.equal(true);
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
      v = AlwaysBeValidating.extend(Validatable, {
        rules: {
          angusMcAsync: rule('input', function(resolve, reject) {
            return spy(resolve, reject);
          })
        }
      }).create();
    });

    it("is not pending", function() {
      expect(this.spy).to.have.been.called;
      expect(v.get('validation.isPending')).to.equal(true);
    });
    describe("when the promise resolves", function() {
      beforeEach(function() {
        this.resolve();
      });
      it("becomes valid", function() {
        expect(v.get('validation.isFulfilled')).to.equal(true);
      });
    });
    describe("when the promise is rejected", function() {
      beforeEach(function() {
        this.reject();
      });
      it("becomes invalid", function() {
        expect(v.get('validation.isFulfilled')).to.equal(false);
      });
    });
  });

  describe("with dependant validations", function() {
    beforeEach(function() {
      v = AlwaysBeValidating.extend({
        rules: {
          first: rule('input', function() {
            return this.get('input.length') > 2;
          }),
          second: rule('input', function() {
            return /\d/.test(this.get('input'));
          }),
          third: rule('input', function() {
            return /W$/.test(this.get('input'));
          }).when('first', 'second')
        }
      }).create();
      v.set('input', 'xyz');
    });
    it("runs the first two validations, but not the third", function() {
      expect(v.get('validation.rules.first.isFulfilled')).to.equal(true);
      expect(v.get('validation.rules.second.isRejected')).to.equal(true);
      expect(v.get('validation.rules.third.isRejected')).to.equal(true);
    });

    describe("making the second validation pass", function() {
      beforeEach(function() {
        v.set('input', 'xyz1');
      });
      it("runs all three validations, failing the third", function() {
        expect(v.get('validation.rules.third.isRejected')).to.equal(true);
      });
      describe("failing the first", function() {
        beforeEach(function() {
          v.set('input', '1');
        });
        it("sets the third back to rejected", function() {
          expect(v.get('validation.rules.third.isRejected')).to.equal(true);
        });
      });
    });
  });
});
