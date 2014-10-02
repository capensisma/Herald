
//This is our Global Object. 
Herald = {
  //Notification global settings
  settings: {
    overrides: {}, //disable functionality for all users. 
    delayEscalation: false
  },

  _media: ['onsite'], //supported media, extension packages should push new kinds
  _mediaRunners: {}, //extension packages load their code here
  _extentionParams: [], //UNDOCUMENTED: allow for more top level params on EventTypes

  //EventTypes allows us to add reusable logic that can be updated
  //without the need for migrations.
  //
  // messageFormat - a function that the package user defines, outputs a message string
  // metadata - useful data like template names that don't need to be in the database
  // media - where these notifications should be sent. 
  _courier: {},
  //add an courier
  addCourier: function (key, options) {
    check(key, String);
    if (Herald._courier[key]) 
      throw new Error('Herald: courier type "' + key + '"" already exists');

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
    var message = function (template) {
      var message, messageFormat = Herald._courier[key].messageFormat

      if (_.isObject(messageFormat) && !_.isFunction(messageFormat) && !_.isString(messageFormat)) {
        if (messageFormat[template]) {
          message = messageFormat[template]
        } else {
          message = messageFormat.default
          if (!message) {
            throw new Meteor.Error('Herald: No default message defined for "' + this.courier + '" notifications');
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
        throw new Meteor.Error('Herald: message not defined for "' + this.courier + '" notifications');
      }
    }


    check(options, Object);
    Herald._courier[key] = {
      message: message,
      messageFormat: options.message,
      metadata: options.metadata
    };

    //media is required but should only throw exceptions on the server, where it is needed.
    if (Meteor.isServer) {
      check(options.media, Object);
      var media = _.keys(options.media)
      if (media.length == 0)
        throw new Error('Herald: courier "'+ key + '" must have at least one medium');
      media.forEach(function (medium) {
        if (!_.contains(Herald._media, medium)) 
          throw new Error('Herald: medium "' + medium + '" is not a known media');
      });
    }
    //define on both, just in case
    Herald._courier[key].media = options.media

    //white-listed params from extension packages
    _.extend(Herald._courier[key], _.pick(options, Herald._extentionParams)) 
  }
};

//The collection and any instance functionality
Herald.collection = new Meteor.Collection('notifications', {
  transform: function (notification) {
    if (notification.courier) { //courier may not be available if fields filter was called.

      //This is the basic message you want to output. Use in the app or as an email subject line
      // it is optional and is set up with createNotification from the server code.
      notification.message = function (template) {
        check(template, Match.Optional(String));
        if (Herald._courier[this.courier].message) {
          //make the notification data accessible to the message function.
          return Herald._courier[this.courier].message.call(this, template)
        };
      };

      //Load the current metadata, this will update with a hot-code-push.
      notification.metadata = Herald._courier[notification.courier].metadata
    };
    return notification
  }
});

//Minimum requirement for notifications to work while still providing 
//basic security. For added limitations use `Herald.deny` in 
//your app.
Herald.collection.allow({
  insert: function(userId, doc){
    // new notifications can only be created via a Meteor method
    return false;
  },
  update: function (userId, doc) {
    return userId == doc.userId
  },
  remove: function (userId, doc) {
    return userId == doc.userId
  }
});


//literally mark-All-Herald-As-Read, cheers :)
Meteor.methods({
  markAllNotificationsAsRead: function() {
    Herald.collection.update(
      {userId: Meteor.userId()},
      {
        $set:{
          read: true
        }
      },
      {multi: true}
    );
  }
});

if (Package['mizzao:user-status']) {
  //TODO: somehow notifications should be user aware... somehow
}



Notifications = Herald
