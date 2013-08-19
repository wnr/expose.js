/*! expose.js - v0.1.0 - 2013-08-19
 * https://github.com/wnr/expose.js
 * Copyright (c) 2013 Lucas Wiener; Licensed MIT
 */


/*
 * expose.js
 * https://github.com/wnr/expose.js
 *
 * Copyright (c) 2013 Lucas Wiener
 * Licensed under the MIT license.
 */

(function(expose) {
  'use strict';

  expose.run = function() {

  };

})(this.expose = this.expose || {});

(function(expose) {
  'use strict';

  if(!expose) {
    throw new Error('Invalid expose given.');
  }

  if(expose.log) {
    expose.log('A log function is already defined. Discarding log module.');
    return;
  }

  expose.log = function() {
    if(!console || !console.log) {
      return;
    }

    var message;

    for(var i = 0; i < arguments.length; i++) {
      message += arguments[i];

      if((i+1) === arguments.length) {
        message += ' ';
      }
    }

    if(message) {
      console.log(message);
    }
  };

})(this.expose = this.expose || {});

/**
 * Tweaked Ajax functions from Quirksmode.
 *
 * Taken from https://github.com/scottjehl/Respond/blob/master/respond.src.js
 * branch: master
 * commit: 50a62fec6712db4a31d8707aacaaf7063c0a5a29
 * 
 * Changed by Lucas Wiener to fit better into the project.
 */

(function(expose, global) {
  'use strict';

  if(!expose) {
    throw new Error('Invalid expose given.');
  }

  if(expose.ajax) {
    expose.log('An ajax function is already. Discarding ajax module.');
    return;
  }

  //Define ajax object.
  var xmlHttp = (function() {
    var xmlhttpmethod = false;

    try {
      xmlhttpmethod = new global.XMLHttpRequest();
    } catch(e){
      xmlhttpmethod = new global.ActiveXObject('Microsoft.XMLHTTP');
    }

    return function() {
      return xmlhttpmethod;
    };
  })();

  expose.ajax = function(url, callback) {
    var req = xmlHttp();

    if(!req) {
      return;
    }

    req.open('GET', url, true);
   
    req.onreadystatechange = function () {
      if (req.readyState !== 4 || req.status !== 200 && req.status !== 304){
        return;
      }

      callback(req.responseText);
    };

    if (req.readyState === 4){
      return;
    }

    req.send( null );
  };
}(this.expose = this.expose || {}, this));

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

    $('style').each(function(i, stylesheet) {
      output += $(stylesheet).html();
    });

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
      function done(output) {
        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift(output);

        cb.apply(expose, args);
      }

      if(stylesheet.cssText) {
        done(stylesheet.cssText);
        return;
      }

      var rules = stylesheet.cssRules || stylesheet.rules || null;

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
        var rule = rules[i];
        output += rule.cssText;
      }

      done(output);
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
    var computed;
    var output = [];

    var element = $(':root')[0];

    if(document.defaultView && document.defaultView.getComputedStyle) {
      computed = document.defaultView.getComputedStyle(element, null);

      output = $.merge([], computed);
    } else if(element.currentStyle) {
      computed = element.currentStyle;

      $.each(computed, function(prop) {
        output.push(prop);
      });
    } else {
      throw new Error('Failed to retrieve computed style.');
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

/**
 * Downloaded from https://github.com/wnr/css-parse/blob/master/index.js
 * branch: master
 * commit: d2e8fbb85193ab11d157bfc3f0b7e1f8d9ede677
 *
 * Changed by Lucas Wiener to work better with this project.
 */

(function(expose) {

  if(!expose) {
    throw new Error('Invalid expose given.');
  }

  if(expose.parseCSS) {
    return;
    expose.log('A CSS parser is already defined in expose object. Discarding CSS parser module.');
  }

  expose.parseCSS = function(css, options){
    options = options || {};

    /**
     * Positional.
     */

    var lineno = 1;
    var column = 1;

    /**
     * Shim-wrapper for trim. Will use native trim if supported, otherwise the trim
     * found at https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
     * at commit 32ff9747d5baaa446d5a49d0078ed38fcff93ab0
     *
     * Modified a bit to not pollute String prototype.
     */
    
    function trim(str) {
      if (str === void 0 || str === null) {
        throw new TypeError('trim called on null or undefined');
      }

      var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
      '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
      '\u2029\uFEFF';

      if (!String.prototype.trim || ws.trim()) {
        // http://blog.stevenlevithan.com/archives/faster-trim-javascript
        // http://perfectionkills.com/whitespace-deviations/
        ws = "[" + ws + "]";
        var trimBeginRegexp = new RegExp("^" + ws + ws + "*");
        var trimEndRegexp = new RegExp(ws + ws + "*$"); 

        return String(str).replace(trimBeginRegexp, "").replace(trimEndRegexp, "");
      }

      return String(str).trim();
    }

    /**
     * Update lineno and column based on `str`.
     */

    function updatePosition(str) {
      var lines = str.match(/\n/g);
      if (lines) lineno += lines.length;
      var i = str.lastIndexOf('\n');
      column = ~i ? str.length - i : column + str.length;
    }

    /**
     * Mark position and patch `node.position`.
     */

    function position() {
      var start = { line: lineno, column: column };
      if (!options.position) return positionNoop;

      return function(node){
        node.position = {
          start: start,
          end: { line: lineno, column: column }
        };

        whitespace();
        return node;
      }
    }

    /**
     * Return `node`.
     */

    function positionNoop(node) {
      whitespace();
      return node;
    }

    /**
     * Error `msg`.
     */

    function error(msg) {
      var err = new Error(msg + ' near line ' + lineno + ':' + column);
      err.line = lineno;
      err.column = column;
      err.source = css;
      throw err;
    }

    /**
     * Parse stylesheet.
     */

    function stylesheet() {
      return {
        type: 'stylesheet',
        stylesheet: {
          rules: rules()
        }
      };
    }

    /**
     * Opening brace.
     */

    function open() {
      return match(/^{\s*/);
    }

    /**
     * Closing brace.
     */

    function close() {
      return match(/^}/);
    }

    /**
     * Parse ruleset.
     */

    function rules() {
      var node;
      var rules = [];
      whitespace();
      comments(rules);
      while (css.charAt(0) != '}' && (node = atrule() || rule())) {
        rules.push(node);
        comments(rules);
      }
      return rules;
    }

    /**
     * Match `re` and return captures.
     */

    function match(re) {
      var m = re.exec(css);
      if (!m) return;
      var str = m[0];
      updatePosition(str);
      css = css.slice(str.length);
      return m;
    }

    /**
     * Parse whitespace.
     */

    function whitespace() {
      match(/^\s*/);
    }

    /**
     * Parse comments;
     */

    function comments(rules) {
      var c;
      rules = rules || [];
      while (c = comment()) rules.push(c);
      return rules;
    }

    /**
     * Parse comment.
     */

    function comment() {
      var pos = position();
      if ('/' != css.charAt(0) || '*' != css.charAt(1)) return;

      var i = 2;
      while (null != css.charAt(i) && ('*' != css.charAt(i) || '/' != css.charAt(i + 1))) ++i;
      i += 2;

      var str = css.slice(2, i - 2);
      column += 2;
      updatePosition(str);
      css = css.slice(i);
      column += 2;

      return pos({
        type: 'comment',
        comment: str
      });
    }

    /**
     * Parse selector.
     */

    function selector() {
      var m = match(/^([^{]+)/);
      if (!m) return;
      return trim(m[0]).split(/\s*,\s*/);
    }

    /**
     * Parse declaration.
     */

    function declaration() {
      var pos = position();

      // prop
      var prop = match(/^(\*?[-\/\*\w]+)\s*/);
      if (!prop) return;
      prop = prop[0];

      // :
      if (!match(/^:\s*/)) return error("property missing ':'");

      // val
      var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
      if (!val) return error('property missing value');

      var ret = pos({
        type: 'declaration',
        property: prop,
        value: trim(val[0])
      });

      // ;
      match(/^[;\s]*/);

      return ret;
    }

    /**
     * Parse declarations.
     */

    function declarations() {
      var decls = [];

      if (!open()) return error("missing '{'");
      comments(decls);

      // declarations
      var decl;
      while (decl = declaration()) {
        decls.push(decl);
        comments(decls);
      }

      if (!close()) return error("missing '}'");
      return decls;
    }

    /**
     * Parse keyframe.
     */

    function keyframe() {
      var m;
      var vals = [];
      var pos = position();

      while (m = match(/^(from|to|\d+%|\.\d+%|\d+\.\d+%)\s*/)) {
        vals.push(m[1]);
        match(/^,\s*/);
      }

      if (!vals.length) return;

      return pos({
        type: 'keyframe',
        values: vals,
        declarations: declarations()
      });
    }

    /**
     * Parse keyframes.
     */

    function atkeyframes() {
      var pos = position();
      var m = match(/^@([-\w]+)?keyframes */);

      if (!m) return;
      var vendor = m[1];

      // identifier
      var m = match(/^([-\w]+)\s*/);
      if (!m) return error("@keyframes missing name");
      var name = m[1];

      if (!open()) return error("@keyframes missing '{'");

      var frame;
      var frames = comments();
      while (frame = keyframe()) {
        frames.push(frame);
        frames = frames.concat(comments());
      }

      if (!close()) return error("@keyframes missing '}'");

      return pos({
        type: 'keyframes',
        name: name,
        vendor: vendor,
        keyframes: frames
      });
    }

    /**
     * Parse supports.
     */

    function atsupports() {
      var pos = position();
      var m = match(/^@supports *([^{]+)/);

      if (!m) return;
      var supports = trim(m[1]);

      if (!open()) return error("@supports missing '{'");

      var style = comments().concat(rules());

      if (!close()) return error("@supports missing '}'");

      return pos({
        type: 'supports',
        supports: supports,
        rules: style
      });
    }

    /**
     * Parse media.
     */

    function atmedia() {
      var pos = position();
      var m = match(/^@media *([^{]+)/);

      if (!m) return;
      var media = trim(m[1]);

      if (!open()) return error("@media missing '{'");

      var style = comments().concat(rules());

      if (!close()) return error("@media missing '}'");

      return pos({
        type: 'media',
        media: media,
        rules: style
      });
    }

    /**
     * Parse paged media.
     */

    function atpage() {
      var pos = position();
      var m = match(/^@page */);
      if (!m) return;

      var sel = selector() || [];

      if (!open()) return error("@page missing '{'");
      var decls = comments();

      // declarations
      var decl;
      while (decl = declaration()) {
        decls.push(decl);
        decls = decls.concat(comments());
      }

      if (!close()) return error("@page missing '}'");

      return pos({
        type: 'page',
        selectors: sel,
        declarations: decls
      });
    }

    /**
     * Parse document.
     */

    function atdocument() {
      var pos = position();
      var m = match(/^@([-\w]+)?document *([^{]+)/);
      if (!m) return;

      var vendor = trim(m[1] || '');
      var doc = trim(m[2]);

      if (!open()) return error("@document missing '{'");

      var style = comments().concat(rules());

      if (!close()) return error("@document missing '}'");

      return pos({
        type: 'document',
        document: doc,
        vendor: vendor,
        rules: style
      });
    }

    /**
     * Parse import
     */

    function atimport() {
      return _atrule('import');
    }

    /**
     * Parse charset
     */

    function atcharset() {
      return _atrule('charset');
    }

    /**
     * Parse namespace
     */

    function atnamespace() {
      return _atrule('namespace')
    }

    /**
     * Parse non-block at-rules
     */

    function _atrule(name) {
      var pos = position();
      var m = match(new RegExp('^@' + name + ' *([^;\\n]+);'));
      if (!m) return;
      var ret = { type: name };
      ret[name] = trim(m[1]);
      return pos(ret);
    }

    /**
     * Parse at rule.
     */

    function atrule() {
      return atkeyframes()
        || atmedia()
        || atsupports()
        || atimport()
        || atcharset()
        || atnamespace()
        || atdocument()
        || atpage();
    }

    /**
     * Parse rule.
     */

    function rule() {
      var pos = position();
      var sel = selector();

      if (!sel) return;
      comments();

      return pos({
        type: 'rule',
        selectors: sel,
        declarations: declarations()
      });
    }

    return stylesheet();
  };


}(this.expose = this.expose || {}));