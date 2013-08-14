/*
 * expose.js
 * https://github.com/wnr/expose.js
 *
 * Copyright (c) 2013 Lucas Wiener
 * Licensed under the MIT license.
 */

//Will not pollute global if env is nodejs.
//If browser, then expose should live inside the expose object in the global scope.
var expose = {};

(function(exports) {
  'use strict';
}(typeof exports === 'object' && exports || expose));