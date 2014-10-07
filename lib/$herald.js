//This is our Global Object. $herald.js will be the first file loaded
Herald = {
  //Notification global settings
  settings: {
    overrides: {}, //disable functionality for all users. 
    delayEscalation: false
  },
  _media: function(){ //supported media, extension packages should push new kinds
    return _.union(_.keys(Herald._mediaRunnersServer), _.keys(Herald._mediaRunnersClient), ['onsite']) 
  }, 
  _mediaRunnersServer: {}, //extension packages load their code here on servers
  _mediaRunnersClient: {}, //extension packages load their code here on clients
  _mediaCheckers: {}, //test if courier media data is valid
  _extentionParams: [], //UNDOCUMENTED: allow for more top level params on EventTypes
  _courier: {},
};

// Package users can define a predefined message from the notification instance.
// It requires the user pass a options.message function, string, or object.
//
// If its a function it will be run with the from the instance scope
//
// If its a string it will return a template with the instance
// as its data. 
//
// If its an object it will run any number of templates or functions based on the optional
// string argument given at the time of call. If no string is passed it will default 
// to 'default'. From there it acts the same as ether of the above patterns.
Herald._message = function (template) {
  var message, messageFormat = Herald._courier[this.courier].messageFormat

  if (_.isObject(messageFormat) && !_.isFunction(messageFormat) && !_.isString(messageFormat)) {
    if (messageFormat[template]) {
      message = messageFormat[template]
    } else {
      message = messageFormat.default
      if (!message) {
        throw new Error('Herald: No default message defined for "' + this.courier + '" notifications');
      }
    }
  } 
  message = message || messageFormat

  if (_.isFunction(message)) {
    return message.apply(this) 
  } 

  else if (_.isString(message)) {
    return Blaze.With(this, function(){
      return Template[message]
    });
  } 

  else {
    throw new Error('Herald: message not defined for "' + this.courier + '" notifications');
  }
}
