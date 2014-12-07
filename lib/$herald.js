//This is our Global Object. $herald.js will be the first file loaded
Herald = {
  //Notification global settings
  settings: {
    overrides: {}, //disable functionality for all users. 
    queueTimer: 60000,
    userPreferenceDefault: true,
    collectionName: 'notifications',
    useIronRouter: true
  },

  //media and runners
  _media: function () { //supported media, extension packages should push new kinds
    return _.union(_.keys(Herald._serverRunners), _.keys(Herald._clientRunners))
  },
  _serverRunners: {}, //extension packages load their code here on servers
  _clientRunners: {}, //extension packages load their code here on clients
  _runnerCheckers: {}, //test if courier media data is valid


  //couriers
  _couriers: {},
  _extentionParams: [] //UNDOCUMENTED: allow for more top level params on EventTypes
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
  var message;
  var courier = Herald._getCourier(this.courier);
  var messageFormat = courier && courier.messageFormat;

  if(_.isObject(messageFormat) && !_.isFunction(messageFormat) && !_.isString(messageFormat)) {
    message = messageFormat[template] || messageFormat.default;

    if(!message) {
      throw new Error('Herald: No default message defined for "' + this.courier + '" notifications');
    }
  }
  message = message || messageFormat;

  if(_.isFunction(message)) {
    return message.apply(this)
  }

  else if(_.isString(message)) {
    return Blaze.With(this, function () {
      return Template[message]
    });
  }

  throw new Error('Herald: message not defined for "' + this.courier + '" notifications');
};

Herald._setProperty = function (key, value) {
  var obj = {};
  obj[key] = value;
  return obj;
};

Herald._getProperty = function (obj, keys) {
  var keys = keys.split('.');
  _.each(keys, function (key) {
    obj = obj && obj[key];
  });
  return obj;
};

Herald._getUser = function (user) {
  if (_.isString(user)) {
    user = Meteor.users.findOne(user);
  } 
  else if (!_.isObject(user)) {
    user = Meteor.isClient ? Meteor.user() : Meteor.users.findOne(this.userId);
  }
  return user;
};

// retrieves from Herald._couriers by default, otherwise from obj
Herald._getCourier = function (keys, obj) {
  var courier = obj || Herald._couriers;
  return Herald._getProperty(courier, keys);
};

Herald._setCourier = function (key, val) {
  var keys = key.split('.');
  var orig = Herald._couriers;
  var len = keys.length - 1;
  for (var i = 0; i < len; i++) {
    orig[keys[i]] = orig[keys[i]] || {};
    orig = orig[keys[i]];
  }
  orig[keys[len]] = val;
  return Herald._getCourier(key);
}
