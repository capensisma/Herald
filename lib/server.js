// only publish notifications belonging to the current user
Meteor.publish('notifications', function() {
  return Notifications.collection.find({userId:this.userId, onsite: true});
});

//You can insert manually but this should save you some work.
Notifications.createNotification = function(userIds, params) {
  

  check(userIds, Match.OneOf([String], String)); //TODO: better Collection ID check
  check(params, Object);
  if (!Notifications._eventTypes[params.event])
    throw new Error('Notification: event type does not exists');

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
    // event - this is the eventType, consider renaming
    // data - in database metadata, consider renaming
    // read - default false, consider auto-delete?
    // url - allow of iron:router magic. set read to true if visited (see routeSeenByUser)

    var notification = {
      timestamp: new Date().getTime(),
      userId: userId,
      event: params.event,
      data: params.data,
      read: false,
      url: params.url
    };

    _.each(Notifications._eventTypes[params.event].media, function (medium) {
      //check if this notification should be sent to [medium.name]
      if (sendToMedium(user, params.event, medium.name)) {
        notification[medium.name] = true
      };
    });

    //create notification and return its id
    var notificationId = Notifications.collection.insert(notification);

    //if no pattern to delay escalation has been defined run escalation now
    //if no notificationId then insert failed anD PANIC, STOP, DON'T ACUTALLY DO THIS!
    if (!Notifications.settings.delayEscalation && notificationId) {
      notification._id = notificationId
      Notifications.escalate(notification)
    }

    return notificationId;
  });
};

sendToMedium = function (user, event, medium) {
  var mediumObject = _.find(Notifications._eventTypes[event].media, function (mediumObject) { 
    return mediumObject.name == medium
  });
  //does this eventType support this medium? (false positive)
  if (!mediumObject) {
    return false;
  };
  //is this medium blocked by admin?
  if (Notifications.settings.overrides[medium]) {
    return false;
  };
  //does the user want notifications on this medium?
  //check general preferences and eventType preferences
  if (checkUserPreferencesSet(user, medium)) { //has any preferences
    if (user.profile.notificationPreferences[medium]) { //has general preferences
      if (user.profile.notificationPreferences.eventType) { //override general preference
        if (user.profile.notificationPreferences.eventType[medium]) {
          return true;
        };
      } else {
        return true;
      };
    } else if (user.profile.notificationPreferences.eventType //event only preference
      && user.profile.notificationPreferences.eventType[medium]) {
      return true;
    };
  };
  //if no user preference then use eventType default
  if (mediumObject.default) {
    return true;
  };
  return false;
};

//existence check
checkUserPreferencesSet = function (user, medium) {
  return (user.profile && user.profile.notificationPreferences && 
    user.profile.notificationPreferences[event] && user.profile.notificationPreferences[medium]);
};
