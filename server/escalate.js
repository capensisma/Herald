//allow package users to delay escalations
Meteor.startup(function () {
  //if no pattern is defined then skip this.
  // if (!Herald.settings.delayEscalation) return false;
  console.log('Starting artwells:queue for Herald');
  Meteor.setInterval(function(){Queue.run()}, 60000); /* once a minute */
});


Herald.SetupEscalations = function (notification) {
  if (notification.escalated) return false; //don't resend notifications
  _.each(_.keys(Herald._couriers[notification.courier].media), function (medium) {
    if (!_.contains(_.keys(Herald._serverRunners), medium)) return; //Server only
    command = 'Herald.escalate("' + notification._id + '", "' + medium + '")'
    Queue.add({command: command})
  });
  Herald.collection.update(notification._id, { $set: { escalated: true } } );
}

Herald.escalate = function (notificationId, medium) {

  var notification = Herald.collection.findOne(notificationId);
  if (!notification) return; //notification has been removed
  if (notification.read) return; //don't escalate a read notification!
  if (!notification.media[medium]) return; //already sent or don't send

  var user = Meteor.users.findOne(notification.userId)
  if (!user) return; //user has been removed


  var run = true; //does the user want you to send on this medium?
  if (!Herald.userPrefrence(user, medium, notification.courier)) run = false

  if (run) {
    Herald._serverRunners[medium].call(
      Herald._couriers[notification.courier].media[medium], notification, user)
  };

  //mark the medium as don't send (ether sent or don't send)
  var querry = {}
  querry[ 'media.' + medium ] = false
  Herald.collection.update(notification._id, { $set: querry } );
};
