// Notifications - only load if user is logged in
Tracker.autorun(function() {
  if ( Meteor.userId() ) {
    Meteor.subscribe('notifications');
  };
});
