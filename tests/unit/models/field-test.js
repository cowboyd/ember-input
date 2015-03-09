/*jshint expr: true*/
import { describe, it, beforeEach, afterEach, sinon } from '../../test-helper';
import Ember from 'ember';
import Field from 'ember-input/models/field';
import { rule } from 'ember-input/models/rule';

var expect = window.expect;

describe.only('Field', function() {
  var field;
  describe('default states', function() {
    beforeEach(function() {
      field = Field.create();
      field.set('input', '');
    });
    it("has an empty string for a input", function() {
      expect(field.get('value')).to.equal('');
    });
  });
  describe("with no customization", function() {
    beforeEach(function() {
      field = Field.create();
      field.set('input', 'foo');
    });
    it("has the same value as the input", function() {
      expect(field.get('value')).to.equal('foo');
    });
  });

  describe("with an unformatting", function() {
    beforeEach(function() {
      field = Field.create({
        unformat: function(input) {
          return parseInt(input);
        },
        rules: {
          anInteger: rule('input', function() {
            return !isNaN(parseInt(this.get('input')));
          })
        }
      });
      field.set('input', '5');
    });
    it("is valid", function() {
      expect(field.get('validation.isFulfilled')).to.equal(true);
    });

    it('derives the value from the transform function', function() {
      expect(field.get('value')).to.equal(5);
    });
    describe("if the input is set to an invalid value", function() {
      beforeEach(function() {
        field.set('input', 'five');
      });
      it("keeps the same value", function() {
        expect(field.get('value')).to.equal(5);
      });
    });
    describe("if the input is set to another valid value", function() {
      beforeEach(function() {
        field.set('input', '10');
      });
      it("switches to that value", function() {
        expect(field.get('value')).to.equal(10);
      });
    });
  });
});
