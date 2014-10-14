//allow package users to delay escalations
Meteor.startup(function () {
  //if no pattern is defined then skip this.
  // if (!Herald.settings.delayEscalation) return false;
  console.log('Starting artwells:queue for Herald');
  Meteor.setInterval(function(){Queue.run()}, Herald.settings.queueTimmer); /* once a minute */
});


Herald.SetupEscalations = function (notification) {
  if (notification.escalated) return false; //don't resend notifications
  _.each(_.keys(Herald._couriers[notification.courier].media), function (medium) {
    if (!_.contains(_.keys(Herald._serverRunners), medium)) return; //Server only
    if (!notification.media[medium].send || notification.media[medium].sent) return; //already sent/don't send
    var command = 'Herald.escalate("' + notification._id + '", "' + medium + '")'
    Queue.add({command: command })
  });
  Herald.collection.update(notification._id, { $set: { escalated: true } } );
}

Herald.escalate = function (notificationId, medium) {

  var notification = Herald.collection.findOne(notificationId);
  if (!notification) return; //notification has been removed
  if (notification.read) return; //don't escalate a read notification!
  if (!notification.media[medium].send || notification.media[medium].sent) return; //already sent/don't send
  if (Herald.settings.overrides[medium]) return; //disabled by override

  var user = Meteor.users.findOne(notification.userId)
  if (!user) return; //user has been removed


  var run = true; //does the user want you to send on this medium?
  if (!Herald.userPreference(user, medium, notification.courier)) run = false

  var thisOnRun = Herald._couriers[notification.courier].media[medium].onRun
  if (_.isFunction(thisOnRun)) {
    var result = thisOnRun.call(new onRun(), notification, user, run)
    if (!result.command) throw new Error('Herald:' + medium + ' onRun did not return a command')
    run = onRunResolve(notification, medium, result, run)
  }

  if (run) {
    Herald._serverRunners[medium].call(
      Herald._couriers[notification.courier].media[medium], notification, user)
    var query = {}
    query[ 'media.' + medium] = {send: false, sent: true};
    Herald.collection.update(notification._id, { $set: query } );
  } else {
    var query = {};
    query['media.' + medium + '.send'] =  false
    Herald.collection.update(notification._id, { $set: query } );
  }
  
  
};
