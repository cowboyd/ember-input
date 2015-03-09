/*jshint expr: true*/
import { describe, it, beforeEach, afterEach, sinon } from '../../test-helper';
import Ember from 'ember';
import Form from 'ember-input';
import Field from 'ember-input/models/field';

var expect = window.expect;

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

  describe("default template context on a complex form", function() {
    beforeEach(function() {
      form = Form.extend({
        firstName: Form.field(),
        lastName: Form.field()
      }).create();
      this.value = {
        firstName: 'Charles',
        lastName: 'Lowell'
      };
      form.set('value', this.value);
    });

    it("is not the same as the value ", function() {
      expect(form.get('templateContext')).not.to.equal(this.value);
    });

    it("populates the form context with the values from the object", function() {
      expect(form.get('templateContext.firstName')).to.equal('Charles');
      expect(form.get('templateContext.lastName')).to.equal('Lowell');
    });
  });

  describe("with multiple atomic fields", function() {
    beforeEach(function() {
      form = Form.extend({
        number: Form.field({
          unformat: function(input) {
            return parseInt(input);
          },
          rules: {
            aNumber: Form.rule('input', function() {
              return !isNaN(parseInt(this.get('input')));
            })
          }
        }),
        string: Form.field()
      }).create();
      form.set('number.input', '5');
      form.set('string.input', 'hello');
    });

    it("has a input which is a rollup of the fields", function() {
      expect(form.get('templateContext.number')).to.equal(5);
      expect(form.get('templateContext.string')).to.equal('hello');
    });
    describe("changing one of the subfields", function() {
      beforeEach(function() {
        form.set('string.input', 'goodbye');
        form.set('number.input', '10');
      });
      it("updates the rollup", function() {
        expect(form.get('templateContext.number')).to.equal(10);
        expect(form.get('templateContext.string')).to.equal('goodbye');
      });
    });
    describe("with an invalid subfield", function() {
      beforeEach(function() {
        form.set('templateContext.number', 'five');
        form.get('validation.isFulfilled');
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

        name: Form.field({
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
      expect(form.get('templateContext.type')).to.equal('short');
    });

    describe("updating the child input", function() {
      beforeEach(function() {
        form.set('name.input', 'Phineas T. Barnstone');
      });
      it("updates the inputs model", function() {
        expect(form.get('templateContext.type')).to.equal('long');
      });
    });
  });

  describe("validation context", function() {
    beforeEach(function() {
      form = Form.extend({
        name: Form.field({
          rules: {
            longish: Form.rule('input', function() {
              return this.get('input.length') > 5;
            }),
            hasNumbers: Form.rule('input', function() {
              return /\d/.test(this.get('input'));
            })
          }
        }),
        rules: {
          hasName: Form.rule('name.value', function() {
            return !Ember.isEmpty(this.get('name.value'));
          })
        }
      }).create();
      form.get('validation.isFulfilled');
    });

    it("is invalid at the top level", function() {
      expect(form.get('validation.isRejected')).to.equal(true);
    });
    it("has a helper to see if a form should be disabled", function() {
      expect(form.get('validation.isNotFulfilled')).to.equal(true);
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
      expect(form.get('validation.name.rules.hasNumbers.isRejected')).to.equal(true);
    });
    it("has a progress api", function() {
      expect(form.get('progress.fulfilled.ratio')).to.equal(0);
      expect(form.get('progress.fulfilled.percentage')).to.equal(0);
      expect(form.get('progress.name.fulfilled.ratio')).to.equal(0);
      expect(form.get('progress.name.fulfilled.percentage')).to.equal(0);
    });
    describe("entering in some valid (although not fully valid input)", function() {
      beforeEach(function() {
        form.set('name.input', 'C3P0');
        form.get('validation.isFulfilled');
      });
      it("is still rejected", function() {
        expect(form.get('validation.isRejected')).to.equal(true);
      });
      it("updates the progress", function() {
        expect(Math.round(form.get('progress.fulfilled.ratio') * 100) / 100).to.equal(0.33);
        expect(Math.round(form.get('progress.rejected.ratio') * 100) / 100).to.equal(0.67);
        expect(Math.round(form.get('progress.rejected.percentage'))).to.equal(67);
        expect(Math.round(form.get('progress.fulfilled.percentage'))).to.equal(33);
        expect(form.get('progress.self.fulfilled.ratio')).to.equal(0);
        expect(form.get('progress.self.fulfilled.percentage')).to.equal(0);
        expect(form.get('progress.self.rejected.ratio')).to.equal(1);
        expect(form.get('progress.self.rejected.percentage')).to.equal(100);
        expect(form.get('progress.name.fulfilled.ratio')).to.equal(0.5);
      });
      it("can access invididual rules as a list", function() {
        expect(form.get('validation.rules.firstObject.isRejected')).to.equal(true);
      });
    });

  });

  describe("composing form", function() {
    describe("with classes", function() {
      beforeEach(function() {
        var FooField = Field.extend();
        form = Form.extend({
          foo: Form.field(FooField)
        }).create();
        form.set('templateContext.foo', 'bar');
      });
      it("works", function() {
        expect(form.get('foo.value')).to.equal('bar');
      });
    });
  });
});
