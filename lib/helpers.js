//get notifications by user, [courier, [[medium]]
Herald.getNotifications = function (user, courier, medium, options) {
  
  //get user
  if (_.isString(user)) {
    user = Meteor.users.findOne(user);
  } else if (!_.isObject(user)) {
    if (Meteor.isClient) 
      user = Meteor.user();
    else
      user = Meteor.users.findOne(this.userId);
  }
  if (!user._id) throw new Error('Herald - getNotifications: user not found');

  //all
  if (!courier && !medium)
    return Herald.collection.find({userId: user._id});

  //for courier only
  if (courier && !_.contains(_.keys(Herald._courier), courier))
    throw new Error('Herald - getNotifications: courier "'+courier+'" not found');
  if (!medium)
    return Herald.collection.find({userId: user._id, courier: courier});

  //for medium only
  if (medium && !_.contains(Herald.media(), medium))
    throw new Error('Herald - getNotifications: medium "'+medium+'" not found');
  if (!courier) {
    var querry = {userId: user._id};
    var subQuerry = {};
    subQuerry['$exists'] = true;
    querry['media.'+medium] = subQuerry;
    return Herald.collection.find(querry);
  };

  //each specifically
  var querry = {userId: user._id, courier: courier};
  var subQuerry = {};
  subQuerry['$exists'] = true;
  querry['media.'+medium] = subQuerry;
  return Herald.collection.find(querry);
  
}



//literally mark-All-As-Read, cheers :)
Meteor.methods({
  heraldMarkAllAsRead: function() {
    Herald.collection.update(
      {userId: this.userId},
      {
        $set:{
          read: true
        }
      },
      {multi: true}
    );
  }
});
