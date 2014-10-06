// only publish notifications belonging to the current user
Meteor.publish('notifications', function() {
  return Herald.collection.find({userId:this.userId, onsite: true});
});

//You can insert manually but this should save you some work.
Herald.createNotification = function (userIds, params) {
  check(userIds, Match.OneOf([String], String)); //TODO: better Collection ID check
  check(params, Object);
  if (!Herald._courier[params.courier])
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
    // media - a list of all the media the notification can be sent on but has not been.

    var notification = {
      timestamp: new Date().getTime(),
      userId: userId,
      courier: params.courier,
      data: params.data,
      read: false,
      escalated: false,
      url: params.url,
      media: {}
    };

    _.each(_.keys(Herald._courier[params.courier].media), function (medium) {
      //check if this notification should be sent to medium
      var run = true;
      if (Herald.userPrefrence) 
        if (!Herald.userPrefrence(user, medium, notification.courier)) run = false
      
      if (run) {
        notification.media[medium] = true
      };
    });

    //create notification and return its id
    var notificationId = Herald.collection.insert(notification);

    //if no pattern to delay escalation has been defined run escalation now
    //if no notificationId then insert failed anD PANIC, STOP, DON'T ACUTALLY DO THIS!
    if (!Herald.settings.delayEscalation && notificationId) {
      notification._id = notificationId
      Herald.escalate(notification, user)
    }

    return notificationId;
  });
};


//allow package users to delay escalations
Meteor.startup(function () {
  //if no pattern is defined then skip this.
  if (!Herald.settings.delayEscalation) return false;
});

Herald.escalate = function (notification, user) {
  if (notification.escalated) return false; //don't resend notifications
  user = user || Meteor.users.findOne(notification.userId);
  _.each(_.keys(Herald._courier[notification.courier].media), function (medium) {
    if (!_.contains(_.keys(Herald._mediaRunnersServer), medium)) return;

    var run = true;
    if (Herald.userPrefrence) 
      if (!Herald.userPrefrence(user, medium, notification.courier)) run = false

    if (run) {
      Herald._mediaRunnersServer[medium].call(
        Herald._courier[notification.courier].media[medium], notification, user)
    };
  });
  Herald.collection.update(notification._id, { $set: { escalated: true } } );
};

//userPrefrence
//Herald.userPrefrence = function () { /* noop: user, medium, courier */ }


// sendToMedium = function (user, courier, medium) {
//   var mediumObject = Herald._courier[courier].media[medium]

//   //does this courier support this medium? (false positive)
//   if (!mediumObject) {
//     return false;
//   };
//   //is this medium blocked by admin?
//   if (Herald.settings.overrides[medium]) {
//     return false;
//   };
//   //does the user want notifications on this medium?
//   //check general preferences and courier preferences
//   if (checkUserPreferencesSet(user, courier, medium)) { //has any preferences
//     if (user.profile.notificationPreferences[medium]) { //has general preferences
//       if (user.profile.notificationPreferences[courier]) { //override general preference
//         if (user.profile.notificationPreferences[courier][medium]) {
//           return true;
//         };
//       } else {
//         return true;
//       };
//     } else if (user.profile.notificationPreferences.courier //courier only preference
//       && user.profile.notificationPreferences.courier[medium]) {
//       return true;
//     };
//   };
//   //if no user preference then use courier default
//   if (mediumObject.hasOwnProperty('default')) {
//     if (mediumObject.default) {
//       return true;
//     };
//   } else {
//     return true;
//   };
//   return false;
// };

//existence check
// checkUserPreferencesSet = function (user, courier, medium) {
//   return (user.profile && user.profile.notificationPreferences && 
//     (user.profile.notificationPreferences[courier] || user.profile.notificationPreferences[medium]));
// };


//literally mark-All-Herald-As-Read, cheers :)
// Meteor.methods({
//   markAllNotificationsAsRead: function() {
//     Herald.collection.update(
//       {userId: Meteor.userId()},
//       {
//         $set:{
//           read: true
//         }
//       },
//       {multi: true}
//     );
//   }
// });
