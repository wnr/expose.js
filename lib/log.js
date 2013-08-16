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