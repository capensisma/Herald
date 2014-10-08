//The collection and any instance functionality
Herald.collection = new Meteor.Collection('notifications', {
  transform: function (notification) {
    if (notification.courier) { //courier may not be available if fields filter was called.
      var courier = Herald._couriers[notification.courier];
      //This is the basic message you want to output. Use in the app or as an email subject line
      // it is optional and is set up with createNotification from the server code.
      notification.message = function (template) {
        if (template && !_.isString(template))
          throw new Error('Herald: message argument must be undefined or a string')
        if (courier.messageFormat)
          return Herald._message.call(this, template)
        else
          throw new Error('Herald: no message defined for "'+ this.courier +'"')
      };

      //internal scoping and cloning, because js is magically confusing
      if (courier.transform) {
        transform = _.clone(courier.transform)
        notification = _.extend(transform, notification)
      }
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
