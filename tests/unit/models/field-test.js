/*jshint expr: true*/
import { describe, it, beforeEach, afterEach, sinon } from '../../test-helper';
import Ember from 'ember';
import Field from 'ember-input/models/field';
import { rule } from 'ember-input/models/rule';

var expect = window.expect;

describe('Field', function() {
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
        format: function(buffer) {
          return buffer || '';
        },
        unformat: function(input) {
          return parseInt(input) || '';
        },
        rules: {
          anInteger: rule('buffer', function() {
            var buffer = this.get('buffer');
            return !isNaN(parseInt(buffer));
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
  describe("with custom formatting that puts parentheses around something", function() {
    beforeEach(function() {
      field = Field.extend({
        input: "",
        format: function(buffer) {
          if (Ember.isEmpty(buffer)) {
            return "";
          } else {
            return "(" + buffer + ")";
          }
        },
        unformat: function(input) {
          return (input || "").replace("(","").replace(")","");
        }
      }).create();
      field.set('input', 'ohai');
    });
    it("applies to the input", function() {
      expect(field.get('input')).to.equal('(ohai)');
    });
    describe("removing all the input", function() {
      beforeEach(function() {
        field.set('input', '()');
      });
      it("removes the string altogether", function() {
        expect(field.get('input')).to.equal("");
      });
    });
  });

  describe("with custom formatting", function() {
    var field;
    beforeEach(function() {
      field = Field.create({
        value: 5,
        format: function(value) {
          if (value === 5) {
            return 'five';
          } else {
            return value;
          }
        },
        unformat: function(input) {
          if (input === 'five') {
            return 5;
          } else {
            return input;
          }
        }
      });
    });
    it("is formatted correctly", function() {
      expect(field.get('input')).to.equal('five');
    });
    describe("when the value changes", function() {
      beforeEach(function() {
        field.set('value', 6);
      });
      it("updates the value", function() {
        expect(field.get('input')).to.equal(6);
      });
    });
  });
});
