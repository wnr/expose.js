/*! expose.js - v0.1.0 - 2013-08-16
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

(function(context) {
  'use strict';

  context.expose = {};
  var expose = context.expose;

  expose.css = {};

  expose.css.getInternal = function(cb) {
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

  expose.css.getExternal = function(cb) {
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

      cb.apply(context.expose, args);
    }

    if(typeof cb !== 'function') {
      throw new Error('Callback required');
    }

    //Define the variable to use for concatination.
    var output = '';

    var externals = getExternals();
    var processed = 0;

    var onRulesRead = function (rules) {
      if(rules === false) {
        throw new Error('Failed to read rules of stylesheet');
      }

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

  expose.utils = {};

  expose.run = function() {

  };

}(this));

(function(context) {
  'use strict';

  if(!context.expose) {
    throw new Error('log function requires an expose object to be defined in context.');
  }

  if(context.expose.log) {
    throw new Error('A log function is already defined in expose object.');
  }

  context.expose.log = function() {
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

}(this));

/**
 * Tweaked Ajax functions from Quirksmode.
 *
 * Taken from https://github.com/scottjehl/Respond/blob/master/respond.src.js
 * branch: master
 * commit: 50a62fec6712db4a31d8707aacaaf7063c0a5a29
 * 
 * Changed by Lucas Wiener to fit better into the project.
 */

(function(context) {
  'use strict';

  if(!context.expose) {
    throw new Error('ajax function requires an expose object to be defined in context.');
  }

  if(context.expose.ajax) {
    throw new Error('An ajax function is already defined in expose object.');
  }

  //Define ajax object.
  var xmlHttp = (function() {
    var xmlhttpmethod = false;

    try {
      xmlhttpmethod = new context.XMLHttpRequest();
    } catch(e){
      xmlhttpmethod = new context.ActiveXObject('Microsoft.XMLHTTP');
    }

    return function() {
      return xmlhttpmethod;
    };
  })();

  context.expose.ajax = function(url, callback) {
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
}(this));

/**
 * Downloaded from https://github.com/visionmedia/css-parse/blob/master/index.js
 * branch: master
 * commit: b1cd941d4a1e1e05be0c024ad8faefde3be7b60e
 *
 * author: https://github.com/visionmedia
 *
 * Changed by Lucas Wiener to work better with this project.
 */

(function(context) {

  if(!context.expose) {
    throw new Error('CSS parser requires an expose object to be defined in context.');
  }

  if(context.expose.parseCSS) {
    throw new Error('A CSS parser is already defined in expose object.');
  }

  context.expose.parseCSS = function(css, options){
    options = options || {};

    /**
     * Positional.
     */

    var lineno = 1;
    var column = 1;

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
      while (css[0] != '}' && (node = atrule() || rule())) {
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
      if ('/' != css[0] || '*' != css[1]) return;

      var i = 2;
      while (null != css[i] && ('*' != css[i] || '/' != css[i + 1])) ++i;
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
      return m[0].trim().split(/\s*,\s*/);
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
        value: val[0].trim()
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
      var supports = m[1].trim();

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
      var media = m[1].trim();

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

      var vendor = (m[1] || '').trim();
      var doc = m[2].trim();

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
      ret[name] = m[1].trim();
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

}(this));