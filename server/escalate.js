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
