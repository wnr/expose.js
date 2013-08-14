/*
 * expose.js
 * https://github.com/wnr/expose.js
 *
 * Copyright (c) 2013 Lucas Wiener
 * Licensed under the MIT license.
 */

(function(exports) {

  'use strict';

  exports.awesome = function() {
    return 'awesome';
  };

}(typeof exports === 'object' && exports || this));
