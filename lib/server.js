// only publish notifications belonging to the current user
Meteor.publish('notifications', function() {
  return Notifications.collection.find({userId:this.userId, onsite: true});
});

//You can insert manually but this should save you some work.
Notifications.createNotification = function (userIds, params) {
  

  check(userIds, Match.OneOf([String], String)); //TODO: better Collection ID check
  check(params, Object);
  if (!Notifications._courier[params.courier])
    throw new Error('Notification: courier type does not exists');

  // always assume multiple users.
  if (_.isString(userIds)) userIds = [userIds]
  users = Meteor.users.find({_id: {$in: userIds}}, {fields: {profile: 1}})
  users.forEach(function (user) {
    //create a notification for each user
    userId = user._id

    //When creating a new notification
    // 
    // timestamp - you should timestamp every doc
    // userId - there must be a user to notify
    // courier - this is the courier
    // data - in database metadata, consider renaming
    // read - default false, consider auto-delete?
    // escalated - track if higher level notifications have run
    // url - allow of iron:router magic. set read to true if visited (see routeSeenByUser)

    var notification = {
      timestamp: new Date().getTime(),
      userId: userId,
      courier: params.courier,
      data: params.data,
      read: false,
      escalated: false,
      url: params.url
    };

    _.each(_.keys(Notifications._courier[params.courier].media), function (medium) {
      //check if this notification should be sent to medium
      if (sendToMedium(user, params.courier, medium)) {
        notification[medium] = true
      };
    });

    //create notification and return its id
    var notificationId = Notifications.collection.insert(notification);

    //if no pattern to delay escalation has been defined run escalation now
    //if no notificationId then insert failed anD PANIC, STOP, DON'T ACUTALLY DO THIS!
    if (!Notifications.settings.delayEscalation && notificationId) {
      notification._id = notificationId
      Notifications.escalate(notification, user)
    }

    return notificationId;
  });
};

sendToMedium = function (user, courier, medium) {
  var mediumObject = Notifications._courier[courier].media[medium]

  //does this courier support this medium? (false positive)
  if (!mediumObject) {
    return false;
  };
  //is this medium blocked by admin?
  if (Notifications.settings.overrides[medium]) {
    return false;
  };
  //does the user want notifications on this medium?
  //check general preferences and courier preferences
  if (checkUserPreferencesSet(user, courier, medium)) { //has any preferences
    if (user.profile.notificationPreferences[medium]) { //has general preferences
      if (user.profile.notificationPreferences[courier]) { //override general preference
        if (user.profile.notificationPreferences[courier][medium]) {
          return true;
        };
      } else {
        return true;
      };
    } else if (user.profile.notificationPreferences.courier //courier only preference
      && user.profile.notificationPreferences.courier[medium]) {
      return true;
    };
  };
  //if no user preference then use courier default
  if (mediumObject.hasOwnProperty('default')) {
    if (mediumObject.default) {
      return true;
    };
  } else {
    return true;
  };
  return false;
};

//existence check
checkUserPreferencesSet = function (user, courier, medium) {
  return (user.profile && user.profile.notificationPreferences && 
    (user.profile.notificationPreferences[courier] || user.profile.notificationPreferences[medium]));
};


//allow package users to delay escalations
Meteor.startup(function () {
  //if no pattern is defined then skip this.
  if (!Notifications.settings.delayEscalation) return false;
});

Notifications.escalate = function (notification, user) {
  if (notification.escalated) return false; //don't resend notifications
  user = user || Meteor.users.findOne(notification.userId);
  _.each(_.keys(Notifications._courier[notification.courier].media), function (medium) {
    if (medium == 'onsite') return;
    if (sendToMedium(user, notification.courier, medium)) {
      Notifications._mediaRunners[medium].call(
        Notifications._courier[notification.courier].media[medium], notification, user)
    };
  });
  Notifications.collection.update(notification._id, { $set: { escalated: true } } );
};

Notifications.addRunner = function (name, fn) {
  Notifications._media.push(name) 
  Notifications._mediaRunners[name] = fn
}
