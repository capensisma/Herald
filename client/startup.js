//only load if user is logged in
Tracker.autorun(function() {
  if ( Meteor.userId() ) {
    Meteor.subscribe('notifications');
  };
});

//if iron route is prescient then do some fun routing magic
//basically if the user goes to a provided url, stored in the notification,
//then make the notification as read. Because its safe to assume they know about 
//what ever you were trying to tell them.
Meteor.startup(function () {
  if (Package['iron:router']) { //your likely using the new packaging system if you have this code
    routeSeenByUser = function () {
      //TODO (possibly): make this a method
      //TODO (possibly): allow for disable overall and/or on a per user basis
      Herald.collection.find({url:this.path, read: false}, {fields: {read: 1}}).forEach(function (notification) {
        Herald.collection.update(notification._id, { $set: { read: true } })
      });
    }
    if (Router.onRun) //not sure when this changed so just to be safe
      Router.onRun(routeSeenByUser);
    else
      Router.load(routeSeenByUser);
  };

  var runnersQuery = [], runners = _.keys(Herald._clientRunners);
  _.each(runners, function (runner) {
    var query = {};
    query['media.' + runner] = true;
    runnersQuery.push(query);
  });

  if (_.isEmpty(runnersQuery)) return;
  Herald.collection.find({$or: runnersQuery, read: false}).observe({
    added: function (notification) {
      var media = notification.media //send status

      var user = Meteor.user()
      _.each(runners, function (medium) {
        if (!media[medium]) return; //sent or don't send
        var run = true;
        if (Herald.userPrefrence) 
          if (!Herald.userPrefrence(user, medium, notification.courier)) run = false

        if (run) {
          Herald._clientRunners[medium].call(
            Herald._couriers[notification.courier].media[medium], notification, user)
        };

        //mark medium as sent or don't send (onsite being the sole exception)
        if (medium != 'onsite') {
          media[medium] = false
        }
      });

      //update sent or don't send
      Herald.collection.update(notification._id, {$set: { media: media } });
    }
  });
});
