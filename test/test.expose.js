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
          expect(result).to.equal('\n      #visual {\n        background-color: #eee;\n      }\n    \n      #visual .error {\n        color: red;\n      }\n    ');
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

    describe('updateStyles', function() {
      it('should be a function', function() {
        expect(expose.css.updateStyles).to.be.a('function');
      });

      it('should update internal rules according to internal and external stylesheets', function(done) {
        expose.css.updateStyles(function() {
          expect(expose.css.rules).to.not.be.empty();

          for(var i = 0; i < expose.css.rules.length; i++) {
            var rule = expose.css.rules[i];

            expect(rule.type).to.equal('rule');
            done();
          }
        });
      });
    });

    describe('getSupportedProperties', function() {
      it('should be a function', function() {
        expect(expose.css.getSupportedProperties).to.be.a('function');
      });

      it('should return a property object', function() {
        var result = expose.css.getSupportedProperties();
        expect(result).to.be.an('array');
        expect(result).to.not.be.empty();
      });
    });

    describe('getComputedStyle', function() {
      it('should be a function', function() {
        expect(expose.css.getComputedStyle).to.be.a('function');
      });

      it('should return the same set of properties as getSupportedProperties()', function() {
        var supported = expose.css.getSupportedProperties();
        var computed = expose.css.getComputedStyle($('li.test'));

        expect(computed).to.be.an('object');
        expect(supported.length).to.equal(computed.length);

        for(var i = 0; i < computed.length; i++) {
          expect(supported).to.contain(computed[i].property);
        }
      });
    });

    /*describe('getStyleByCSS', function() {
      it('should be a function', function() {
        expect(expose.css.getStyleByCSS).to.be.a('function');
      });

      it('should return the same set of properties as getSupportedProperties()', function() {
        var supported = expose.css.getSupportedProperties();
        var styles = expose.css.getStyleByCSS($('li.test'));

        expect(styles).to.be.an('object');
        expect(supported.length).to.equal(styles.length);

        for(var i = 0; i < styles.length; i++) {
          expect(supported).to.contain(styles[i].property);
        }
      });
    });*/
  });

  describe('test', function() {
    it('should work', function() {
      var a = expose.css.diff('[{"property":"background-attachment","value":"scroll"},{"property":"background-clip","value":"border-box"},{"property":"background-color","value":"rgba(0, 0, 0, 0)"},{"property":"background-image","value":"none"},{"property":"background-origin","value":"padding-box"},{"property":"background-position","value":"0% 0%"},{"property":"background-repeat","value":"repeat"},{"property":"background-size","value":"auto"},{"property":"border-bottom-color","value":"rgb(136, 136, 136)"},{"property":"border-bottom-left-radius","value":"0px"},{"property":"border-bottom-right-radius","value":"0px"},{"property":"border-bottom-style","value":"none"},{"property":"border-bottom-width","value":"0px"},{"property":"border-collapse","value":"separate"},{"property":"border-image-outset","value":"0px"},{"property":"border-image-repeat","value":"stretch"},{"property":"border-image-slice","value":"100%"},{"property":"border-image-source","value":"none"},{"property":"border-image-width","value":"1"},{"property":"border-left-color","value":"rgb(136, 136, 136)"},{"property":"border-left-style","value":"none"},{"property":"border-left-width","value":"0px"},{"property":"border-right-color","value":"rgb(136, 136, 136)"},{"property":"border-right-style","value":"none"},{"property":"border-right-width","value":"0px"},{"property":"border-top-color","value":"rgb(136, 136, 136)"},{"property":"border-top-left-radius","value":"0px"},{"property":"border-top-right-radius","value":"0px"},{"property":"border-top-style","value":"none"},{"property":"border-top-width","value":"0px"},{"property":"bottom","value":"auto"},{"property":"box-shadow","value":"none"},{"property":"box-sizing","value":"content-box"},{"property":"caption-side","value":"top"},{"property":"clear","value":"none"},{"property":"clip","value":"auto"},{"property":"color","value":"rgb(136, 136, 136)"},{"property":"cursor","value":"auto"},{"property":"direction","value":"ltr"},{"property":"display","value":"block"},{"property":"empty-cells","value":"show"},{"property":"float","value":"right"},{"property":"font-family","value":"\'Helvetica Neue\', Helvetica, Arial, sans-serif"},{"property":"font-size","value":"12px"},{"property":"font-style","value":"normal"},{"property":"font-variant","value":"normal"},{"property":"font-weight","value":400},{"property":"height","value":"40px"},{"property":"image-rendering","value":"auto"},{"property":"left","value":"auto"},{"property":"letter-spacing","value":0},{"property":"line-height","value":"18px"},{"property":"list-style-image","value":"none"},{"property":"list-style-position","value":"outside"},{"property":"list-style-type","value":"none"},{"property":"margin-bottom","value":"0px"},{"property":"margin-left","value":"5px"},{"property":"margin-right","value":"5px"},{"property":"margin-top","value":"0px"},{"property":"max-height","value":"none"},{"property":"max-width","value":"none"},{"property":"min-height","value":"0px"},{"property":"min-width","value":"0px"},{"property":"opacity","value":"1"},{"property":"orphans","value":"auto"},{"property":"outline-color","value":"rgb(136, 136, 136)"},{"property":"outline-offset","value":"0px"},{"property":"outline-style","value":"none"},{"property":"outline-width","value":"0px"},{"property":"overflow-wrap","value":"normal"},{"property":"overflow-x","value":"visible"},{"property":"overflow-y","value":"visible"},{"property":"padding-bottom","value":"0px"},{"property":"padding-left","value":"0px"},{"property":"padding-right","value":"0px"},{"property":"padding-top","value":"0px"},{"property":"page-break-after","value":"auto"},{"property":"page-break-before","value":"auto"},{"property":"page-break-inside","value":"auto"},{"property":"pointer-events","value":"auto"},{"property":"position","value":"static"},{"property":"resize","value":"none"},{"property":"right","value":"auto"},{"property":"speak","value":"normal"},{"property":"table-layout","value":"auto"},{"property":"tab-size","value":"8"},{"property":"text-align","value":"left"},{"property":"text-decoration","value":"none"},{"property":"text-indent","value":"0px"},{"property":"text-rendering","value":"auto"},{"property":"text-shadow","value":"none"},{"property":"text-overflow","value":"clip"},{"property":"text-transform","value":"none"},{"property":"top","value":"auto"},{"property":"transition-delay","value":"0s"},{"property":"transition-duration","value":"0s"},{"property":"transition-property","value":"all"},{"property":"transition-timing-function","value":"ease"},{"property":"unicode-bidi","value":"normal"},{"property":"vertical-align","value":"baseline"},{"property":"visibility","value":"visible"},{"property":"white-space","value":"normal"},{"property":"widows","value":"auto"},{"property":"width","value":"40px"},{"property":"word-break","value":"normal"},{"property":"word-spacing","value":"0px"},{"property":"word-wrap","value":"normal"},{"property":"z-index","value":"auto"},{"property":"zoom","value":"1"},{"property":"-webkit-animation-delay","value":"0s"},{"property":"-webkit-animation-direction","value":"normal"},{"property":"-webkit-animation-duration","value":"0s"},{"property":"-webkit-animation-fill-mode","value":"none"},{"property":"-webkit-animation-iteration-count","value":"1"},{"property":"-webkit-animation-name","value":"none"},{"property":"-webkit-animation-play-state","value":"running"},{"property":"-webkit-animation-timing-function","value":"ease"},{"property":"-webkit-appearance","value":"none"},{"property":"-webkit-backface-visibility","value":"visible"},{"property":"-webkit-background-clip","value":"border-box"},{"property":"-webkit-background-composite","value":"source-over"},{"property":"-webkit-background-origin","value":"padding-box"},{"property":"-webkit-background-size","value":"auto"},{"property":"-webkit-border-fit","value":"border"},{"property":"-webkit-border-horizontal-spacing","value":"0px"},{"property":"-webkit-border-image","value":"none"},{"property":"-webkit-border-vertical-spacing","value":"0px"},{"property":"-webkit-box-align","value":"stretch"},{"property":"-webkit-box-decoration-break","value":"slice"},{"property":"-webkit-box-direction","value":"normal"},{"property":"-webkit-box-flex","value":"0"},{"property":"-webkit-box-flex-group","value":"1"},{"property":"-webkit-box-lines","value":"single"},{"property":"-webkit-box-ordinal-group","value":"1"},{"property":"-webkit-box-orient","value":"horizontal"},{"property":"-webkit-box-pack","value":"start"},{"property":"-webkit-box-reflect","value":"none"},{"property":"-webkit-box-shadow","value":"none"},{"property":"-webkit-clip-path","value":"none"},{"property":"-webkit-color-correction","value":"default"},{"property":"-webkit-column-break-after","value":"auto"},{"property":"-webkit-column-break-before","value":"auto"},{"property":"-webkit-column-break-inside","value":"auto"},{"property":"-webkit-column-axis","value":"auto"},{"property":"-webkit-column-count","value":"auto"},{"property":"-webkit-column-gap","value":"normal"},{"property":"-webkit-column-progression","value":"normal"},{"property":"-webkit-column-rule-color","value":"rgb(136, 136, 136)"},{"property":"-webkit-column-rule-style","value":"none"},{"property":"-webkit-column-rule-width","value":"0px"},{"property":"-webkit-column-span","value":"none"},{"property":"-webkit-column-width","value":"auto"},{"property":"-webkit-filter","value":"none"},{"property":"-webkit-align-content","value":"stretch"},{"property":"-webkit-align-items","value":"stretch"},{"property":"-webkit-align-self","value":"stretch"},{"property":"-webkit-flex-basis","value":"auto"},{"property":"-webkit-flex-grow","value":"0"},{"property":"-webkit-flex-shrink","value":"1"},{"property":"-webkit-flex-direction","value":"row"},{"property":"-webkit-flex-wrap","value":"nowrap"},{"property":"-webkit-justify-content","value":"flex-start"},{"property":"-webkit-font-kerning","value":"auto"},{"property":"-webkit-font-smoothing","value":"auto"},{"property":"-webkit-font-variant-ligatures","value":"normal"},{"property":"-webkit-grid-auto-columns","value":"auto"},{"property":"-webkit-grid-auto-flow","value":"none"},{"property":"-webkit-grid-auto-rows","value":"auto"},{"property":"-webkit-grid-columns","value":"none"},{"property":"-webkit-grid-rows","value":"none"},{"property":"-webkit-grid-start","value":"auto"},{"property":"-webkit-grid-end","value":"auto"},{"property":"-webkit-grid-before","value":"auto"},{"property":"-webkit-grid-after","value":"auto"},{"property":"-webkit-highlight","value":"none"},{"property":"-webkit-hyphenate-character","value":"auto"},{"property":"-webkit-hyphenate-limit-after","value":"auto"},{"property":"-webkit-hyphenate-limit-before","value":"auto"},{"property":"-webkit-hyphenate-limit-lines","value":"no-limit"},{"property":"-webkit-hyphens","value":"manual"},{"property":"-webkit-line-align","value":"none"},{"property":"-webkit-line-box-contain","value":"block inline replaced"},{"property":"-webkit-line-break","value":"auto"},{"property":"-webkit-line-clamp","value":"none"},{"property":"-webkit-line-grid","value":"none"},{"property":"-webkit-line-snap","value":"none"},{"property":"-webkit-locale","value":"auto"},{"property":"-webkit-margin-before-collapse","value":"collapse"},{"property":"-webkit-margin-after-collapse","value":"collapse"},{"property":"-webkit-marquee-direction","value":"auto"},{"property":"-webkit-marquee-increment","value":"6px"},{"property":"-webkit-marquee-repetition","value":"infinite"},{"property":"-webkit-marquee-style","value":"scroll"},{"property":"-webkit-mask-box-image","value":"none"},{"property":"-webkit-mask-box-image-outset","value":"0px"},{"property":"-webkit-mask-box-image-repeat","value":"stretch"},{"property":"-webkit-mask-box-image-slice","value":"0 fill"},{"property":"-webkit-mask-box-image-source","value":"none"},{"property":"-webkit-mask-box-image-width","value":"auto"},{"property":"-webkit-mask-clip","value":"border-box"},{"property":"-webkit-mask-composite","value":"source-over"},{"property":"-webkit-mask-image","value":"none"},{"property":"-webkit-mask-origin","value":"border-box"},{"property":"-webkit-mask-position","value":"0% 0%"},{"property":"-webkit-mask-repeat","value":"repeat"},{"property":"-webkit-mask-size","value":"auto"},{"property":"-webkit-order","value":"0"},{"property":"-webkit-perspective","value":"none"},{"property":"-webkit-perspective-origin","value":"20px 20px"},{"property":"-webkit-print-color-adjust","value":"economy"},{"property":"-webkit-rtl-ordering","value":"logical"},{"property":"-webkit-tap-highlight-color","value":"rgba(0, 0, 0, 0.4)"},{"property":"-webkit-text-combine","value":"none"},{"property":"-webkit-text-decorations-in-effect","value":"none"},{"property":"-webkit-text-emphasis-color","value":"rgb(136, 136, 136)"},{"property":"-webkit-text-emphasis-position","value":"over"},{"property":"-webkit-text-emphasis-style","value":"none"},{"property":"-webkit-text-fill-color","value":"rgb(136, 136, 136)"},{"property":"-webkit-text-orientation","value":"vertical-right"},{"property":"-webkit-text-security","value":"none"},{"property":"-webkit-text-stroke-color","value":"rgb(136, 136, 136)"},{"property":"-webkit-text-stroke-width","value":"0px"},{"property":"-webkit-transform","value":"none"},{"property":"-webkit-transform-origin","value":"20px 20px"},{"property":"-webkit-transform-style","value":"flat"},{"property":"-webkit-transition-delay","value":"0s"},{"property":"-webkit-transition-duration","value":"0s"},{"property":"-webkit-transition-property","value":"all"},{"property":"-webkit-transition-timing-function","value":"ease"},{"property":"-webkit-user-drag","value":"auto"},{"property":"-webkit-user-modify","value":"read-only"},{"property":"-webkit-user-select","value":"text"},{"property":"-webkit-writing-mode","value":"horizontal-tb"},{"property":"-webkit-app-region","value":"no-drag"},{"property":"buffered-rendering","value":"auto"},{"property":"clip-path","value":"none"},{"property":"clip-rule","value":"nonzero"},{"property":"mask","value":"none"},{"property":"filter","value":"none"},{"property":"flood-color","value":"rgb(0, 0, 0)"},{"property":"flood-opacity","value":"1"},{"property":"lighting-color","value":"rgb(255, 255, 255)"},{"property":"stop-color","value":"rgb(0, 0, 0)"},{"property":"stop-opacity","value":"1"},{"property":"color-interpolation","value":"srgb"},{"property":"color-interpolation-filters","value":"linearrgb"},{"property":"color-rendering","value":"auto"},{"property":"fill","value":"#000000"},{"property":"fill-opacity","value":"1"},{"property":"fill-rule","value":"nonzero"},{"property":"marker-end","value":"none"},{"property":"marker-mid","value":"none"},{"property":"marker-start","value":"none"},{"property":"mask-type","value":"luminance"},{"property":"shape-rendering","value":"auto"},{"property":"stroke","value":"none"},{"property":"stroke-dasharray","value":"none"},{"property":"stroke-dashoffset","value":"0"},{"property":"stroke-linecap","value":"butt"},{"property":"stroke-linejoin","value":"miter"},{"property":"stroke-miterlimit","value":"4"},{"property":"stroke-opacity","value":"1"},{"property":"stroke-width","value":"1"},{"property":"alignment-baseline","value":"auto"},{"property":"baseline-shift","value":"baseline"},{"property":"dominant-baseline","value":"auto"},{"property":"kerning","value":"0"},{"property":"text-anchor","value":"start"},{"property":"writing-mode","value":"lr-tb"},{"property":"glyph-orientation-horizontal","value":"0deg"},{"property":"glyph-orientation-vertical","value":"auto"},{"property":"-webkit-svg-shadow","value":"none"},{"property":"vector-effect","value":"none"}]', '[{"property":"background-attachment","value":"scroll"},{"property":"background-clip","value":"border-box"},{"property":"background-color","value":"rgba(0, 0, 0, 0)"},{"property":"background-image","value":"none"},{"property":"background-origin","value":"padding-box"},{"property":"background-position","value":"0% 0%"},{"property":"background-repeat","value":"repeat"},{"property":"background-size","value":"auto auto"},{"property":"border-bottom-color","value":"rgb(136, 136, 136)"},{"property":"border-bottom-left-radius","value":"0px"},{"property":"border-bottom-right-radius","value":"0px"},{"property":"border-bottom-style","value":"none"},{"property":"border-bottom-width","value":"0px"},{"property":"border-collapse","value":"separate"},{"property":"border-left-color","value":"rgb(136, 136, 136)"},{"property":"border-left-style","value":"none"},{"property":"border-left-width","value":"0px"},{"property":"border-right-color","value":"rgb(136, 136, 136)"},{"property":"border-right-style","value":"none"},{"property":"border-right-width","value":"0px"},{"property":"border-top-color","value":"rgb(136, 136, 136)"},{"property":"border-top-left-radius","value":"0px"},{"property":"border-top-right-radius","value":"0px"},{"property":"border-top-style","value":"none"},{"property":"border-top-width","value":"0px"},{"property":"bottom","value":"auto"},{"property":"caption-side","value":"top"},{"property":"clear","value":"none"},{"property":"clip","value":"auto"},{"property":"color","value":"rgb(136, 136, 136)"},{"property":"cursor","value":"auto"},{"property":"direction","value":"ltr"},{"property":"display","value":"block"},{"property":"empty-cells","value":"show"},{"property":"float","value":"right"},{"property":"font-family","value":"\'Helvetica Neue\', Helvetica, Arial, sans-serif"},{"property":"font-size","value":"12px"},{"property":"font-style","value":"normal"},{"property":"font-variant","value":"normal"},{"property":"font-weight","value":400},{"property":"height","value":"40px"},{"property":"left","value":"auto"},{"property":"letter-spacing","value":0},{"property":"line-height","value":"18px"},{"property":"list-style-image","value":"none"},{"property":"list-style-position","value":"outside"},{"property":"list-style-type","value":"none"},{"property":"margin-bottom","value":"0px"},{"property":"margin-left","value":"5px"},{"property":"margin-right","value":"5px"},{"property":"margin-top","value":"0px"},{"property":"max-height","value":"none"},{"property":"max-width","value":"none"},{"property":"min-height","value":"0px"},{"property":"min-width","value":"0px"},{"property":"opacity","value":"1"},{"property":"orphans","value":"2"},{"property":"outline-color","value":"rgb(136, 136, 136)"},{"property":"outline-style","value":"none"},{"property":"outline-width","value":"0px"},{"property":"overflow-x","value":"visible"},{"property":"overflow-y","value":"visible"},{"property":"padding-bottom","value":"0px"},{"property":"padding-left","value":"0px"},{"property":"padding-right","value":"0px"},{"property":"padding-top","value":"0px"},{"property":"page-break-after","value":"auto"},{"property":"page-break-before","value":"auto"},{"property":"page-break-inside","value":"auto"},{"property":"pointer-events","value":"auto"},{"property":"position","value":"static"},{"property":"resize","value":"none"},{"property":"right","value":"auto"},{"property":"table-layout","value":"auto"},{"property":"text-align","value":"auto"},{"property":"text-decoration","value":"none"},{"property":"text-indent","value":"0px"},{"property":"text-rendering","value":"auto"},{"property":"text-shadow","value":"none"},{"property":"text-overflow","value":"clip"},{"property":"text-transform","value":"none"},{"property":"top","value":"auto"},{"property":"unicode-bidi","value":"normal"},{"property":"vertical-align","value":"baseline"},{"property":"visibility","value":"visible"},{"property":"white-space","value":"normal"},{"property":"widows","value":"2"},{"property":"width","value":"40px"},{"property":"word-break","value":"normal"},{"property":"word-spacing","value":"0px"},{"property":"word-wrap","value":"normal"},{"property":"z-index","value":"auto"},{"property":"zoom","value":"1"},{"property":"-webkit-animation-delay","value":"0s"},{"property":"-webkit-animation-direction","value":"normal"},{"property":"-webkit-animation-duration","value":"0s"},{"property":"-webkit-animation-fill-mode","value":"none"},{"property":"-webkit-animation-iteration-count","value":"1"},{"property":"-webkit-animation-name","value":"none"},{"property":"-webkit-animation-play-state","value":"running"},{"property":"-webkit-animation-timing-function","value":"cubic-bezier(0.25, 0.1, 0.25, 1)"},{"property":"-webkit-appearance","value":"none"},{"property":"-webkit-backface-visibility","value":"visible"},{"property":"-webkit-background-clip","value":"border-box"},{"property":"-webkit-background-composite","value":"source-over"},{"property":"-webkit-background-origin","value":"padding-box"},{"property":"-webkit-background-size","value":"auto auto"},{"property":"-webkit-border-fit","value":"border"},{"property":"-webkit-border-horizontal-spacing","value":"0px"},{"property":"-webkit-border-image","value":"none"},{"property":"-webkit-border-vertical-spacing","value":"0px"},{"property":"-webkit-box-align","value":"stretch"},{"property":"-webkit-box-direction","value":"normal"},{"property":"-webkit-box-flex","value":"0"},{"property":"-webkit-box-flex-group","value":"1"},{"property":"-webkit-box-lines","value":"single"},{"property":"-webkit-box-ordinal-group","value":"1"},{"property":"-webkit-box-orient","value":"horizontal"},{"property":"-webkit-box-pack","value":"start"},{"property":"-webkit-box-reflect","value":"none"},{"property":"-webkit-box-shadow","value":"none"},{"property":"-webkit-box-sizing","value":"content-box"},{"property":"-webkit-color-correction","value":"default"},{"property":"-webkit-column-break-after","value":"auto"},{"property":"-webkit-column-break-before","value":"auto"},{"property":"-webkit-column-break-inside","value":"auto"},{"property":"-webkit-column-count","value":"auto"},{"property":"-webkit-column-gap","value":"normal"},{"property":"-webkit-column-rule-color","value":"rgb(136, 136, 136)"},{"property":"-webkit-column-rule-style","value":"none"},{"property":"-webkit-column-rule-width","value":"0px"},{"property":"-webkit-column-width","value":"auto"},{"property":"-webkit-font-smoothing","value":"auto"},{"property":"-webkit-highlight","value":"none"},{"property":"-webkit-line-break","value":"normal"},{"property":"-webkit-line-clamp","value":"none"},{"property":"-webkit-margin-bottom-collapse","value":"collapse"},{"property":"-webkit-margin-top-collapse","value":"collapse"},{"property":"-webkit-marquee-direction","value":"auto"},{"property":"-webkit-marquee-increment","value":"6px"},{"property":"-webkit-marquee-repetition","value":"infinite"},{"property":"-webkit-marquee-style","value":"scroll"},{"property":"-webkit-mask-attachment","value":"scroll"},{"property":"-webkit-mask-box-image","value":"none"},{"property":"-webkit-mask-clip","value":"border-box"},{"property":"-webkit-mask-composite","value":"source-over"},{"property":"-webkit-mask-image","value":"none"},{"property":"-webkit-mask-origin","value":"border-box"},{"property":"-webkit-mask-position","value":"0% 0%"},{"property":"-webkit-mask-repeat","value":"repeat"},{"property":"-webkit-mask-size","value":"auto auto"},{"property":"-webkit-nbsp-mode","value":"normal"},{"property":"-webkit-perspective","value":"none"},{"property":"-webkit-perspective-origin","value":"20px 20px"},{"property":"-webkit-rtl-ordering","value":"logical"},{"property":"-webkit-text-decorations-in-effect","value":"none"},{"property":"-webkit-text-fill-color","value":"rgb(136, 136, 136)"},{"property":"-webkit-text-security","value":"none"},{"property":"-webkit-text-stroke-color","value":"rgb(136, 136, 136)"},{"property":"-webkit-text-stroke-width","value":"0px"},{"property":"-webkit-transform","value":"none"},{"property":"-webkit-transform-origin","value":"20px 20px"},{"property":"-webkit-transform-style","value":"flat"},{"property":"-webkit-transition-delay","value":"0s"},{"property":"-webkit-transition-duration","value":"0s"},{"property":"-webkit-transition-property","value":"all"},{"property":"-webkit-transition-timing-function","value":"cubic-bezier(0.25, 0.1, 0.25, 1)"},{"property":"-webkit-user-drag","value":"auto"},{"property":"-webkit-user-modify","value":"read-only"},{"property":"-webkit-user-select","value":"text"},{"property":"clip-path","value":"none"},{"property":"clip-rule","value":"nonzero"},{"property":"mask","value":"none"},{"property":"filter","value":"none"},{"property":"flood-color","value":"rgb(0, 0, 0)"},{"property":"flood-opacity","value":"1"},{"property":"lighting-color","value":"rgb(255, 255, 255)"},{"property":"stop-color","value":"rgb(0, 0, 0)"},{"property":"stop-opacity","value":"1"},{"property":"color-interpolation","value":"srgb"},{"property":"color-interpolation-filters","value":"linearrgb"},{"property":"color-rendering","value":"auto"},{"property":"fill","value":"#000000"},{"property":"fill-opacity","value":"1"},{"property":"fill-rule","value":"nonzero"},{"property":"image-rendering","value":"auto"},{"property":"marker-end","value":"none"},{"property":"marker-mid","value":"none"},{"property":"marker-start","value":"none"},{"property":"shape-rendering","value":"auto"},{"property":"stroke","value":"none"},{"property":"stroke-dasharray","value":""},{"property":"stroke-dashoffset","value":""},{"property":"stroke-linecap","value":"butt"},{"property":"stroke-linejoin","value":"miter"},{"property":"stroke-miterlimit","value":"4"},{"property":"stroke-opacity","value":"1"},{"property":"stroke-width","value":""},{"property":"alignment-baseline","value":"auto"},{"property":"baseline-shift","value":"baseline"},{"property":"dominant-baseline","value":"auto"},{"property":"kerning","value":""},{"property":"text-anchor","value":"start"},{"property":"writing-mode","value":"lr-tb"},{"property":"glyph-orientation-horizontal","value":"0deg"},{"property":"glyph-orientation-vertical","value":"auto"},{"property":"-webkit-svg-shadow","value":"none"}]');

      var output = [];

      for(var i = 0; i < a.length; i++) {
        if(a[i].type === 'value') {
          output.push(a[i]);
        }
      }

      console.log(output);
    });
  });

  describe('run', function() {
    it('should be a function', function() {
      expect(expose.run).to.be.a('function');
    });
  });
});