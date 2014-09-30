//allow package users to delay escalations
Meteor.startup(function () {
  //if no pattern is defined then skip this.
  if (!Notifications.settings.delayEscalation) return false
});

Notifications.escalate = function (notification) {
  console.log(notification)
}


