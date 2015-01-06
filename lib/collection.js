Meteor.startup(function () {
  //The collection and any instance functionality
  Herald.collection = new Meteor.Collection(Herald.settings.collectionName, {
    transform: function (notification) {
      if (notification.courier) { //courier may not be available if fields filter was called.
        var courier = Herald._getCourier(notification.courier);
        //This is the basic message you want to output. Use in the app or as an email subject line
        // it is optional and is set up with createNotification from the server code.
        notification.message = function (template) {
          if (template && !_.isString(template))
            throw new Error('Herald: message argument must be undefined or a string')
          if (courier.messageFormat)
            return Herald._message.call(this, template);

          throw new Error('Herald: no message defined for "' + this.courier + '"');
        };

        if (courier && courier.transform) {
          _.defaults(notification, courier.transform);
        }
      };
      return notification;
    }
  });

  var expireTime = Herald.settings.expireAfterSeconds;
  if (Meteor.isServer && expireTime) {
    Herald.collection._ensureIndex({ 'timestamp': 1 }, { 'expireAfterSeconds': expireTime });
  }

  //Minimum requirement for notifications to work while still providing
  //basic security. For added limitations use `Herald.deny` in
  //your app.
  Herald.collection.allow({
    insert: function (userId, doc) {
      // new notifications can only be created via a Meteor method
      return false;
    },
    update: function (userId, doc) {
      return userId == doc.userId;
    },
    remove: function (userId, doc) {
      return userId == doc.userId;
    }
  });
});
