Herald.escalate = function (notification) {
  var media = notification.media; //send status
  var user = Meteor.user();

  _.each(_.keys(Herald._clientRunners), function (medium) {        
    if (!notification.media[medium]) return; //only run the notifications runners
    if (notification.media[medium].sent || !notification.media[medium].send) return;
    if (Herald.settings.overrides[medium]) return; //disabled by override
    if (medium === 'onsite') return; //don't run onsite

    var run = true; 
    if (!Herald.userPreference(user, medium, notification.courier)) run = false;

    var courier = Herald._getCourier(notification.courier);
    var courierMedium = courier && courier.media[medium];
    var thisOnRun = courierMedium && courierMedium.onRun;

    if (_.isFunction(thisOnRun)) {
      var result = thisOnRun.call(new onRun(), notification, user, run);
      if (!result.command) throw new Error('Herald:' + medium + ' onRun did not return a command')
      run = onRunResolve(notification, medium, result, run);
    }

    if (run) {
      Herald._clientRunners[medium].call(courierMedium, notification, user);
      var query = Herald._setProperty('media.' + medium, { send: false, sent: true });  
    } else {
      var query = Herald._setProperty('media.' + medium + '.send', false);
    }

    Herald.collection.update(notification._id, { $set: query });
  });
}
