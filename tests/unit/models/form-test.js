/*jshint expr: true*/
import { describe, it, beforeEach, afterEach, sinon } from '../../test-helper';
import Ember from 'ember';
import Form from 'ember-input';

describe('Form', function() {
  var form;
  afterEach(function() {
    if (!!form) {
      form.destroy();
    }
  });
  function isFulfilled() {
    return form.get('validator.isFulfilled');
  }

  describe('default states', function() {
    beforeEach(function() {
      form = Form.create();
      form.set('input', '');
    });
    it("has an empty string for a input", function() {
      expect(form.get('input')).to.equal('');
    });
  });

  describe("with no customization", function() {
    beforeEach(function() {
      form = Form.create();
      form.set('input', 'foo');
    });
    it("has the same value as the input", function() {
      expect(form.get('value')).to.equal('foo');
    });
  });

  describe("with a transform", function() {
    beforeEach(function() {
      form = Form.create({
        transform: function(input) {
          return parseInt(input);
        },
        rules: {
          anInteger: Form.rule('input', function() {
            return !isNaN(parseInt(this.get('input')));
          })
        }
      });
      form.set('input', '5');
    });
    it('derives the value from the transform function', function() {
      expect(form.get('value')).to.equal(5);
    });
    describe("if the input is set to an invalid value", function() {
      beforeEach(function() {
        form.set('input', 'five');
      });
      it("keeps the same value", function() {
        expect(form.get('value')).to.equal(5);
      });
    });
    describe("if the input is set to another valid value", function() {
      beforeEach(function() {
        form.set('input', '10');
      });
      it("switches to that value", function() {
        expect(form.get('value')).to.equal(10);
      });
    });
  });

  describe("with custom formatting", function() {
    beforeEach(function() {
      form = Form.create({
        value: 5,
        transform: function(input) {
          if (input === 'not five') {
            return 6;
          } else if (input === 'five') {
            return 5;
          } else {
            return NaN;
          }
        },
        merge: function(value) {
          if (value === 5) {
            return 'five';
          } else {
            return 'not five';
          }
        }
      });
    });
    it("is formatted correctly", function() {
      expect(form.get('input')).to.equal('five');
    });
    describe("when the value changes", function() {
      beforeEach(function() {
        form.set('value', 6);
      });
      it("updates the formatted value", function() {
        expect(form.get('input')).to.equal('not five');
      });
    });
  });

  describe("with no validations at all", function() {
    beforeEach(function() {
      form = Form.extend({}).create();
      form.get('validator.isFulfilled');
    });

    it("is valid", function() {
      expect(form.get('validator.isSettled')).to.equal(true);
      expect(form.get('validator.isFulfilled')).to.equal(true);
      expect(form.get('validator.isRejected')).to.equal(false);
    });

    describe("pushing any kind of nonsense into its input", function() {
      beforeEach(function() {
        form.set('input', 'xyz%^((()))');
      });
      it("remains valid", function() {
        expect(form.get('validator.isFulfilled')).to.equal(true);
      });
    });

  });

  describe("with a simple validation", function() {
    beforeEach(function() {
      form = Form.extend({
        rules: {
          longEnough: Form.rule('input.length', function() {
            return this.get('input.length') > 3;
          })
        }
      }).create();

      isFulfilled();
    });
    it("starts of as invalid", function() {
      expect(form.get('validator.isFulfilled')).to.equal(false);
      expect(form.get('validator.isRejected')).to.equal(true);
    });
    describe("updating the input", function() {
      beforeEach(function() {
        form.set('input', 'football');
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
      form = Form.extend({
        rules: {
          angusMcAsync: Form.rule('input', function(resolve, reject) {
            return spy(resolve, reject);
          })
        }
      }).create();
      isFulfilled();
    });

    it("is not pending", function() {
      expect(this.spy).to.have.been.called;
      expect(form.get('validator.isPending')).to.equal(true);
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
    beforeEach(function() {
      form = Form.extend({
        number: Form.hasOne({
          transform: function(input) {
            return parseInt(input);
          },
          rules: {
            aNumber: Form.rule('input', function() {
              return !isNaN(parseInt(this.get('input')));
            })
          }
        }),
        string: Form.hasOne()
      }).create();
      // form.set('string.input', 'hello');
      form.set('number.input', '5');
      form.set('string.input', 'hello');
      isFulfilled();
    });

    it("has a input which is a rollup of the fields", function() {
      expect(form.get('input.number')).to.equal(5);
      expect(form.get('input.string')).to.equal('hello');
    });
    describe("changing one of the subfields", function() {
      beforeEach(function() {
        form.set('number.input', '10');
        form.set('string.input', 'goodbye');
      });
      it("updates the rollup", function() {
        expect(form.get('input.number')).to.equal(10);
        expect(form.get('input.string')).to.equal('goodbye');
      });
    });
    describe("with an invalid subfield", function() {
      beforeEach(function() {
        form.set('input.number', 'five');
      });

      it("is not valid", function() {
        expect(form.get('number.validator.isRejected')).to.equal(true);
        expect(form.get('validator.isRejected')).to.equal(true);
      });
    });
  });

  describe.skip("with a validation that has dependencies", function() {

  });

  describe("incorporating read only values from children", function() {
    beforeEach(function() {
      form = Form.extend({
        type: Form.reads('name.type'),

        name: Form.hasOne({
          type: Ember.computed('input', function() {
            if (this.get('input.length') > 15) {
              return 'long';
            } else {
              return 'short';
            }
          })
        })
      }).create();
      form.set('name.input', '');
    });

    it("is visible on the input", function() {
      expect(form.get('input.type')).to.equal('short');
    });

    describe("updating the child input", function() {
      beforeEach(function() {
        form.set('name.input', 'Phineas T. Barnstone');
      });
      it("updates the inputs model", function() {
        expect(form.get('input.type')).to.equal('long');
      });
    });
  });
});
