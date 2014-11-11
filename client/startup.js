//only load if user is logged in
Tracker.autorun(function () {
  if(Meteor.userId()) {
    Meteor.subscribe('notifications');
  }
});

//if iron route is prescient then do some fun routing magic
//basically if the user goes to a provided url, stored in the notification,
//then make the notification as read. Because its safe to assume they know about 
//what ever you were trying to tell them.
Meteor.startup(function () {

  // check for iron:router and if you depend on older version then iron:router disable it
  if(Package['iron:router'] && Herald.settings.useIronRouter) {
    var routeSeenByUser = function () {
      //TODO (possibly): make this a method
      //TODO (possibly): allow for disable overall and/or on a per user basis
      Herald.collection.find({
        url: this.path,
        read: false
      }, {fields: {read: 1}}).forEach(function (notification) {
        Herald.collection.update(notification._id, {$set: {read: true}})
      });
      this.next();
    };
    if(Router.onRun) //not sure when this changed so just to be safe
      Router.onRun(routeSeenByUser);
    else
      Router.load(routeSeenByUser);
  }

  var runnersQuery = [];
  _.each(_.keys(Herald._clientRunners), function (runner) {
    var query = {};
    query['media.' + runner] = {send: true, sent: false};
    runnersQuery.push(query);
  });

  if(_.isEmpty(runnersQuery)) return;
  Herald.collection.find({$or: runnersQuery, read: false}).observe({
    added: function (notification) {
      Herald.escalate(notification)
    },
    changed: function (notification) {
      Herald.escalate(notification)
    }
  });
});
