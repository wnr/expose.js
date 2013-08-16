'use strict';

describe('expose.js', function() {
  it('should be an object', function() {
    expect(expose).to.be.an('object');
  });

  it('should have a css parser defined', function() {
    expect(expose.parseCSS).to.be.a('function');
  });

  it('should have ajax function defined', function() {
    expect(expose.ajax).to.be.a('function');
  });

  describe('css', function() {
    it('should be an object', function() {
      expect(expose.css).to.be.an('object');
    });

    describe('getInternal', function() {
      it('should be a function', function() {
        expect(expose.css.getInternal).to.be.a('function');
      });

      it('should concat all internal stylesheets', function(done) {
        expose.css.getInternal(function(result) {
          expect(result).to.be.a('string');
          expect(result).to.equal('\n    #visual {\n      background-color: #eee;\n    }\n  \n    #visual .error {\n      color: red;\n    }\n  ');
          done();
        });
      });
    });

    describe('getExternal', function() {
      it('should be a function', function() {
        expect(expose.css.getExternal).to.be.a('function');
      });

      it('should concat all external stylesheets', function(done) {
        expose.css.getExternal(function(result) {
          expect(result).to.be.a('string');

          //TODO: Test this better.

          //Read occurances of strings.
          var style1 = result.indexOf('style1');
          var mocha = result.indexOf('mocha');
          var style2 = result.indexOf('style2');

          //Expect all to be found.
          expect(!!~style1).to.equal(true);
          expect(!!~mocha).to.equal(true);
          expect(!!~style2).to.equal(true);

          //Now, style1 should be before mocha that should be before style2.
          expect(style1 < mocha < style2).to.equal(true);

          done();
        });
      });
    });
  });

  describe('run', function() {
    it('should be a function', function() {
      expect(expose.run).to.be.a('function');
    });
  });
});