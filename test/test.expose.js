'use strict';

describe('expose.js', function() {
  it('should be an object', function() {
    expect(expose).to.be.an('object');
  });

  describe('run', function() {
    it('should be a function', function() {
      expect(expose.run).to.be.a('function');
    });
  });
});