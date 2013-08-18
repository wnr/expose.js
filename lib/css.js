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

  css.rules = [];
  
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

  css.updateStyles = function(cb) {
    var styles;

    function onDone(result) {
      if(!styles) {
        styles += result;
      } else {
        styles += result;
        var rules = expose.parseCSS(styles).stylesheet.rules;

        for(var i = 0; i < rules.length; i++) {
          var rule = rules[i];

          if(rule.type === 'rule') {
            css.rules.push(rule);
          }
        }

        cb();
      }
    }

    css.getInternal(onDone);
    css.getExternal(onDone);
  };

  css.getSupportedProperties = function() {
    function getComputed(element) {
      if(document.defaultView.getComputedStyle) {
        return document.defaultView.getComputedStyle(element, null);
      } else if(element.currentStyle) {
        return element.currentStyle;
      } else {
        throw new Error('Failed to retrieve computed style.');
      }
    }

    var output = [];

    var computed = getComputed($(':root')[0]);

    for(var i = 0; i < computed.length; i++) {
      output.push(computed[i]);
    }

    return output;
  };

  css.getStyleByCSS = function($element) {
    function getRules(tag, id, name, classes) {
      function match(selector, string) {
        return string && !!~selector.search(new RegExp(string, 'i'));
      }

      var output = [];

      for(var i = 0; i < expose.css.rules.length; i++) {
        for(var j = 0; j < expose.css.rules[i].selectors.length; j++) {
          var selector = expose.css.rules[i].selectors[j];

          if(match(selector, tag) || match(selector, id) || match(selector, name)) {
            output.push(expose.css.rules[i]);
            continue;
          }

          //Search for classes.
          for(var k = 0; k < classes.length; k++) {
            if(match(selector, classes[i])) {
              output.push(expose.css.rules[i]);
              break;
            }
          }
        }
      }

      return output;
    }

    if(!$element || $element.length === 0) {
      throw new Error('Invalid arguments.');
    }

    var potentialRules = [];

    for(var $parent = $element; $parent.prop('tagName'); $parent = $parent.parent()) {
      var tag = $parent.prop('tagName');
      var id = $parent.prop('id');
      var name = $parent.prop('name');
      var classes = $parent.prop('class').split(' ');

      $.merge(potentialRules, getRules(tag, id, name, classes));
    }

    console.log('hej');
  };

  css.getComputedStyle = function($element) {
    if(!$element || $element.length === 0) {
      throw new Error('Invalid arguments.');
    }

    var properties = css.getSupportedProperties();

    var styles = [];

    for(var i = 0; i < properties.length; i++) {
      var property = properties[i];

      var styleObject = {};
      styleObject.property = property;
      styleObject.value = $element.css(property);
 
      styles.push(styleObject);
    }

    return styles;
  };

  css.diff = function(css1, css2) {
    function findProperty(object, property) {
      for(var i = 0; i < object.length; i++) {
        if(object[i].property === property) {
          return i;
        }
      }

      return -1;
    }

    var diff = [];

    var first = jQuery.parseJSON(css1);
    var second = jQuery.parseJSON(css2);

    for(var i = 0; i < first.length; i++) {
      var property = first[i].property;
      var value = first[i].value;

      var otherindex = findProperty(second, property);
      if(!~otherindex) {
        diff.push({
          type: 'missing',
          first: first[i]
        });
        continue;
      }

      if(value !== second[otherindex].value) {
        diff.push({
          type: 'value',
          first: first[i],
          second: second[otherindex]
        });
      }
    }

    for(var j = i+1; j < second.length; j++) {
      diff.push({
        type: 'missing',
        second: second[j]
      });
    }
    
    return diff;
  };

})(this.expose = this.expose || {});