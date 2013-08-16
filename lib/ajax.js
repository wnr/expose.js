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