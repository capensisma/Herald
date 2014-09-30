//allow package users to delay escalations
Meteor.startup(function () {
  //if no pattern is defined then skip this.
  if (!Notifications.settings.delayEscalation) return false;
});

Notifications.escalate = function (notification, user) {
  user = user || Meteor.users.findOne(notification.userId);
  _.each(Notifications._eventTypes[notification.event].media, function (medium) {
    if (medium.name == 'onsite') return;
    if (sendToMedium(user, notification.event, medium.name)) {
      Notifications._mediaRunners[medium.name](notification, user)
    };
  });
};


