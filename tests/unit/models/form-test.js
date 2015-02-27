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
    return form.get('validation.isFulfilled');
  }

  describe('default states', function() {
    beforeEach(function() {
      form = Form.create();
      form.set('input', '');
    });
    it("has an empty string for a input", function() {
      expect(form.get('scope')).to.equal('');
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

  describe("with custom serialization", function() {
    beforeEach(function() {
      form = Form.create({
        value: 5,
        serialize: function(value) {
          if (value === 5) {
            return 'five';
          } else {
            return value;
          }
        },
        transform: function(input) {
          if (input === 'five') {
            return 5;
          } else {
            return input;
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
        expect(form.get('input')).to.equal(6);
      });
    });
  });

  describe("with no validations at all", function() {
    beforeEach(function() {
      form = Form.extend({}).create();
      form.get('validation.isFulfilled');
    });

    it("is valid", function() {
      expect(form.get('validation.isSettled')).to.equal(true);
      expect(form.get('validation.isFulfilled')).to.equal(true);
      expect(form.get('validation.isRejected')).to.equal(false);
    });

    describe("pushing any kind of nonsense into its input", function() {
      beforeEach(function() {
        form.set('input', 'xyz%^((()))');
      });
      it("remains valid", function() {
        expect(form.get('validation.isFulfilled')).to.equal(true);
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

    });
    it("starts of as invalid", function() {
      expect(form.get('validation.isFulfilled')).to.equal(false);
      expect(form.get('validation.isRejected')).to.equal(true);
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
    });

    it("is not pending", function() {
      expect(this.spy).to.have.been.called;
      expect(form.get('validation.isPending')).to.equal(true);
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
      form.set('number.input', '5');
      form.set('string.input', 'hello');
    });

    it("has a input which is a rollup of the fields", function() {
      expect(form.get('input.number')).to.equal(5);
      expect(form.get('input.string')).to.equal('hello');
    });
    describe("changing one of the subfields", function() {
      beforeEach(function() {
        form.set('string.input', 'goodbye');
        form.set('number.input', '10');
      });
      it("updates the rollup", function() {
        expect(form.get('input.number')).to.equal(10);
        expect(form.get('input.string')).to.equal('goodbye');
      });
    });
    describe("with an invalid subfield", function() {
      beforeEach(function() {
        form.set('scope.number', 'five');
      });

      it("is not valid", function() {
        expect(form.get('validation.isRejected')).to.equal(true);
        expect(form.get('number.validation.isRejected')).to.equal(true);
      });
    });
  });


  describe("incorporating read only values from children", function() {
    beforeEach(function() {
      form = Form.extend({
        type: Form.reads('name.type'),

        name: Form.hasOne({
          input: '',
          type: Ember.computed('input', function() {
            if (this.get('input.length') > 15) {
              return 'long';
            } else {
              return 'short';
            }
          })
        })
      }).create();
    });

    it("is visible on the input", function() {
      expect(form.get('scope.type')).to.equal('short');
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

  describe.skip("validation context", function() {
    beforeEach(function() {
      form = Form.extend({
        name: Form.hasOne({
          rules: {
            longish: Form.rule('input', function() {
              return this.get('input.length') > 5;
            }),
            hasNumbers: Form.rule('input', function() {
              return /\d/.test('input');
            })
          }
        }),
        rules: {
          hasName: Form.rule('scope.name', function() {
            return !Ember.isEmpty(this.get('scope.name'));
          })
        }
      }).create();
    });

    it("is invalid at the top level", function() {
      expect(form.get('validation.isRejected')).to.equal(true);
    });
    it("allows access to the specific rule", function() {
      expect(form.get('validation.rules.hasName.isRejected')).to.equal(true);
      expect(form.get('validation.rules.firstObject.isRejected')).to.equal(true);
    });
    it("allows access child properties", function() {
      expect(form.get('validation.name.isRejected')).to.equal(true);
    });
    it("allows access to individual rules on a child property", function() {
      expect(form.get('validation.name.rules.longish.isRejected')).to.equal(true);
      expect(form.get('validation.name.rules.hasNumber.isRejected')).to.equal(true);
    });
    it("has a progress api", function() {
      expect(form.get('validation.progress.ratio')).to.equal(0);
      expect(form.get('validation.progress.percentage')).to.equal(0);
      expect(form.get('validation.name.progress.ratio')).to.equal(0);
      expect(form.get('validation.name.progress.percentage')).to.equal(0);
    });
    describe("entering in some valid (although not fully valid input)", function() {
      beforeEach(function() {
        form.set('scope.name', 'C3P0');
      });
      it("is still rejected", function() {
        expect(form.get('validation.isRejected')).to.equal(true);
      });
      it("updates the progress of the validation", function() {
        expect(form.get('validation.rules.hasName.isFulfilled')).to.equal(true);
        expect(form.get('validation.progress.ratio')).to.equal(0.66);
        expect(form.get('validation.progress.percentage')).to.equal(66);
        expect(form.get('validation.name.progress.percentage')).to.equal(0.5);
      });
      it("can access invididual rules as a list", function() {
        expect(form.get('validation.rules.firstObject.isFulfilled')).to.equal(true);
      });
    });

  });


  describe.skip("with a validation that has dependencies", function() {

  });
});
