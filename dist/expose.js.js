/*! expose.js - v0.1.0 - 2013-08-14
* https://github.com/wnr/expose.js
* Copyright (c) 2013 Lucas Wiener; Licensed MIT */
(function(exports) {

  'use strict';

  exports.awesome = function() {
    return 'awesome';
  };

}(typeof exports === 'object' && exports || this));
