/* jshint expr:true */
import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import Ember from 'ember';
import startApp from '../helpers/start-app';

var App;

describe('Acceptance: XForm', function() {
  beforeEach(function() {
    App = startApp();
  });

  afterEach(function() {
    Ember.run(App, 'destroy');
  });

  beforeEach(function() {
    visit('/');
  });

  it('contains bound form attributes in the template context', function() {
    expect($('.spec-bound-form-attribute')).to.have.text('Dr. Livingstone, I presume?');
  });
});
