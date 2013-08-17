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