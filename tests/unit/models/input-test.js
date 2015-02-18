/*jshint expr: true*/
import { describe, it, beforeEach, afterEach, sinon } from '../../test-helper';
import Ember from 'ember';
import Input from 'ember-input';

describe('Input', function() {
  var input;
  afterEach(function() {
    if (!!input) {
      input.destroy();
    }
  });
  function isFulfilled() {
    return input.get('validator.isFulfilled');
  }

  describe("with no customization", function() {
    beforeEach(function() {
      input = Input.create({
        source: 'foo'
      });
    });
    it("has the same output as the source", function() {
      expect(input.get('output')).to.equal('foo');
    });
  });

  describe("with a transform", function() {
    beforeEach(function() {
      input = Input.create({
        source: '5',
        transform: function(source) {
          return parseInt(source);
        },
        rules: {
          anInteger: Input.rule('source', function() {
            return !isNaN(parseInt(this.get('source')));
          })
        }
      });
    });
    it('derives the output from the transform function', function() {
      expect(input.get('output')).to.equal(5);
    });
    describe("if the source is set to an invalid value", function() {
      beforeEach(function() {
        input.set('source', 'five');
      });
      it("keeps the same output", function() {
        expect(input.get('output')).to.equal(5);
      });
    });
    describe("if the source is set to another valid value", function() {
      beforeEach(function() {
        input.set('source', '10');
      });
      it("switches to that output", function() {
        expect(input.get('output')).to.equal(10);
      });
    });
  });

  describe("with custom formatting", function() {
    beforeEach(function() {
      input = Input.create({
        output: 5,
        transform: function(source) {
          if (source === 'not five') {
            return 6;
          } else if (source === 'five') {
            return 5;
          } else {
            return NaN;
          }
        },
        format: function(output) {
          if (output === 5) {
            return 'five';
          } else {
            return 'not five';
          }
        }
      });
    });
    it("is formatted correctly", function() {
      expect(input.get('source')).to.equal('five');
    });
    describe("when the output changes", function() {
      beforeEach(function() {
        input.set('output', 6);
      });
      it("updates the formatted value", function() {
        expect(input.get('source')).to.equal('not five');
      });
    });
  });



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

      isFulfilled();
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
    beforeEach(function() {
      input = Input.extend({
        number: Input.hasOne({
          source: '5',
          transform: function(source) {
            return parseInt(source);
          },
          rules: {
            aNumber: Input.rule('source', function() {
              return !isNaN(parseInt(this.get('source')));
            })
          }
        }),
        string: Input.hasOne({
          source: 'hello'
        })
      }).create();
      isFulfilled();
    });
    it("has a source which is a rollup of the fields", function() {
      expect(input.get('source.number')).to.equal('5');
      expect(input.get('source.string')).to.equal('hello');
    });
    describe("changing one of the subfields", function() {
      beforeEach(function() {
        input.set('number.source', '10');
        input.set('string.source', 'goodbye');
      });
      it("updates the rollup", function() {
        expect(input.get('source.number')).to.equal('10');
        expect(input.get('source.string')).to.equal('goodbye');
      });
    });
    describe("with an invalid subfield", function() {
      beforeEach(function() {
        input.set('source.number', 'five');
      });

      it("is not valid", function() {
        expect(input.get('number.validator.isRejected')).to.equal(true);
        expect(input.get('validator.isRejected')).to.equal(true);
      });
    });
  });

  describe("with a collection of objects as a field", function() {
    beforeEach(function() {
      input = Input.extend({
        list: Input.hasMany({
          rules: {
            aNumber: Input.rule('source', function() {
              var val = !isNaN(parseInt(this.get('source')));
              return !isNaN(parseInt(this.get('source')));
            })
          }
        }),
        rules: {
          atLeastOneMemberInList: Input.rule('list.length', function() {
            return this.get('list.length') > 0;
          })
        }
      }).create();
    });
    it("is empty to start out with", function() {
      expect(input.get('list.length')).to.equal(0);
    });
    it("can have validation rules that depend on it", function() {
      expect(input.get('validator.isRejected')).to.equal(true);
    });

    describe("adding a member to the list", function() {
      var member;
      beforeEach(function() {
        member = input.get('list').createObject('5');
      });
      it("has the same value as the input's source in the list", function() {
        expect(input.get('list.firstObject.source')).to.equal('5');
      });
      it("becomes valid", function() {
        expect(input.get('validator.isFulfilled')).to.equal(true);
      });

      describe("setting the single object to an invalid value", function() {
        beforeEach(function() {
          input.set('list.firstObject.source', 'five');
        });

        it("makes the list invalid", function() {
          expect(input.get('list.firstObject.validator.isRejected')).to.equal(true);
          expect(input.get('list.validator.isRejected')).to.equal(true);
        });
        it("causes the entire input to fail validation", function() {
          expect(input.get('validator.isRejected')).to.equal(true);
        });
      });
      describe("removing a member from the list", function() {
        beforeEach(function() {
          member.remove();
        });
        it("removes itself from the list", function() {
          expect(input.get('list.length')).to.equal(0);
        });
      });
    });
  });

  describe.skip("with a validation that has dependencies", function() {

  });

  describe("incorporating read only values from children", function() {
    beforeEach(function() {
      input = Input.extend({
        type: Input.reads('name.type'),

        name: Input.hasOne({
          source: "",
          type: Ember.computed('source', function() {
            if (this.get('source.length') > 15) {
              return 'long';
            } else {
              return 'short';
            }
          })
        })
      }).create();
    });

    it("is visible on the source", function() {
      expect(input.get('source.type')).to.equal('short');
    });

    describe("updating the child input", function() {
      beforeEach(function() {
        input.set('name.source', 'Phineas T. Barnstone');
      });
      it("updates the inputs model", function() {
        expect(input.get('source.type')).to.equal('long');
      });
    });
  });
});
