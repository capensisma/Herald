// only publish notifications belonging to the current user
Meteor.publish('notifications', function () {
  var media = _.keys(Herald._clientRunners).map(function (key) {
    return Herald._setProperty('media.' + key, { send: true, sent: false });
  });
  return Herald.collection.find({ userId: this.userId, $or: media });
});
