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