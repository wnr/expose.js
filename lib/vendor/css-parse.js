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