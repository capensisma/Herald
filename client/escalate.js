Herald.escalate = function (notification) {
  var media = notification.media //send status
  var user = Meteor.user()
  _.each(_.keys(Herald._clientRunners), function (medium) {        
    if (!notification.media[medium]) return; //only run the notifications runners
    if (notification.media[medium].sent || !notification.media[medium].send) return;
    if (medium == 'onsite') return; //don't run onsite
    var run = true; 
    if (!Herald.userPrefrence(user, medium, notification.courier)) run = false

    var thisOnRun = Herald._couriers[notification.courier].media[medium].onRun
    if (_.isFunction(thisOnRun)) {
      var result = thisOnRun.call(new onRun(), notification, user, run)
      if (!result.command) throw new Error('Herald:' + medium + ' onRun did not return a command')
      run = onRunResolve(notification, medium, result, run)
    }

    if (run) {
      Herald._clientRunners[medium].call(Herald._couriers[notification.courier].media[medium], 
        notification, user)
      var querry = { media: {} }
      querry[medium] = { send: false, sent: true }
      Herald.collection.update(notification._id, {$set: querry });
    } else {
      var querry = {};
      querry['media.' + medium + '.send'] =  false
      Herald.collection.update(notification._id, {$set: querry });
    }
  });
}
