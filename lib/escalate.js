//allow package users to delay escalations
Meteor.startup(function () {
  //if no pattern is defined then skip this.
  if (!Notifications.settings.delayEscalation) return false;
});

Notifications.escalate = function (notification, user) {
  if (notification.escalated) return false; //don't resend notifications
  user = user || Meteor.users.findOne(notification.userId);
  _.each(Notifications._courier[notification.event].media, function (medium) {
    if (medium.name == 'onsite') return;
    if (sendToMedium(user, notification.event, medium.name)) {
      Notifications._mediaRunners[medium.name].call(medium, notification, user)
    };
  });
  Notifications.collection.update(notification._id, { $set: { escalated: true } } );
};

Notifications.addRunner = function (name, fn) {
  Notifications._media.push(name) 
  Notifications._mediaRunners[name] = fn
}
