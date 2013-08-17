(function(expose) {
  'use strict';

  if(!expose) {
    throw new Error('Invalid expose given.');
  }

  if(expose.css) {
    expose.log('A css object already exists. Discarding css module.');
    return;
  }

  //Define the css object of the expose object, that will handle all the css reading
  //and manipulating.
  expose.css = {};

  var css = expose.css;
  
  css.getInternal = function(cb) {
    if(typeof cb !== 'function') {
      throw new Error('Callback required');
    }

    var output = '';

    var stylesheets = document.getElementsByTagName('style');

    for(var i = 0; i < stylesheets.length; i++) {
      var css = stylesheets[i].firstChild.data;

      output += css;
    }

    cb(output);
  };

  css.getExternal = function(cb) {
    /**
     * Checks if the given stylesheet is an external stylesheet file.
     */
    function isExternal(stylesheet) {
      return stylesheet.href && stylesheet.href.length > 0;
    }

    function getExternals() {
      //An array holding the external sheets to be read.
      var externals = [];

      //Loop over all external and internal defined stylesheets in the order they are defined.
      for(var i = 0; i < document.styleSheets.length; i++) {
        //Get the current stylesheet.
        var stylesheet = document.styleSheets[i];

        //Check if it is an external stylesheet.
        if(isExternal(stylesheet)) {
          //It is an external stylesheet.

          //Add it to the externals array.
          externals.push(stylesheet);
        }
      }

      return externals;
    }

    function readRules(stylesheet, cb) {
      var rules = stylesheet.cssRules || stylesheet.rule || null;

      if(!rules) {
        //Unable to read css directly from DOM. So load them with ajax and read content that way.

        expose.ajax(stylesheet.href, function(rules) {
          if(rules === false) {
            throw new Error('Failed to read rules of stylesheet');
          }

          expose.log('Read external stylesheet with ajax:', stylesheet.href);

          cb(rules);
        });

        return;
      }

      var output = '';

      for(var i = 0; i < rules.length; i++) {
        output += rules[i].cssText;
      }

      var args = Array.prototype.slice.call(arguments, 2);
      args.unshift(output);

      expose.log('Read external stylesheet with cssText:', stylesheet.href);
      
      cb.apply(expose, args);
    }

    if(typeof cb !== 'function') {
      throw new Error('Callback required');
    }

    //Define the variable to use for concatination.
    var output = '';

    var externals = getExternals();
    var processed = 0;

    var onRulesRead = function (rules) {
      output += rules;

      processed++;

      if(processed === externals.length) {
        cb(output);
      }
    };

    for(var i = 0; i < externals.length; i++) {
      readRules(externals[i], onRulesRead);
    }
  };

})(this.expose = this.expose || {});