// only publish notifications belonging to the current user
Meteor.publish('notifications', function() {
  var media = _.keys(Herald._clientRunners).map(function (key) {
    var medium = {};
    medium['media.'+key] = true;
    return medium;
  });
  var onsite = {};
  onsite['media.onsite'] = true;
  media.push(onsite);
  return Herald.collection.find({userId:this.userId, $or: media});
});
