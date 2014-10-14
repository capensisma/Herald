//You can insert manually but this should save you some work.
Herald.createNotification = function (userIds, params) {
  check(userIds, Match.OneOf([String], String)); //TODO: better Collection ID check
  check(params, Object);
  if (!Herald._couriers[params.courier])
    throw new Error('Notification: courier type does not exists');

  // always assume multiple users.
  if (_.isString(userIds)) userIds = [userIds]
  users = Meteor.users.find({_id: {$in: userIds}}, {fields: {profile: 1}})
  users.forEach(function (user) { //create a notification for each user

    //When creating a new notification
    // 
    // timestamp - you should timestamp every doc
    // userId - there must be a user to notify
    // courier - this is the courier
    // data - in database metadata, consider renaming
    // read - default false, consider auto-delete?
    // escalated - track if higher level notifications have run
    // url - allow of iron:router magic. set read to true if visited (see routeSeenByUser)
    // media - a list of all the media the notification can be sent on but has not been.

    var notification = {
      timestamp: new Date().getTime(),
      userId: user._id,
      courier: params.courier,
      data: params.data,
      read: false,
      escalated: false,
      url: params.url,
      media: {}
    };

    _.each(_.keys(Herald._couriers[params.courier].media), function (medium) {
      //check if this notification should be sent to medium
      var run = true;
      if (Herald._couriers[params.courier].media[medium].fallback) {
        run = false;
      } else {
       if (!Herald.userPreference(user, medium, notification.courier)) run = false;
      };
        
      notification.media[medium] = {send: run, sent: false};
    });

    //create notification and return its id
    var notificationId = Herald.collection.insert(notification);

    //if no notificationId then insert failed anD PANIC, STOP, DON'T ACUTALLY DO THIS!
    if (notificationId) {
      notification._id = notificationId
      Herald.SetupEscalations(notification)
    }

    return notificationId;
  });
};
