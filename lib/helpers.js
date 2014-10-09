//get notifications by user, [courier, [[medium]]
Herald.getNotifications = function (querry, options) {
  var user = querry.user, 
    courier = querry.courier, 
    medium = querry.medium, 
    read = querry.read;

  if (typeof read === "undefined") read = true
  
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
    return Herald.collection.find({userId: user._id, read: read}, options);

  //for courier only
  if (courier && !_.contains(_.keys(Herald._courier), courier))
    throw new Error('Herald - getNotifications: courier "'+courier+'" not found');
  if (!medium)
    return Herald.collection.find({userId: user._id, courier: courier, read: read}, options);

  //for medium only
  if (medium && !_.contains(Herald.media(), medium))
    throw new Error('Herald - getNotifications: medium "'+medium+'" not found');
  if (!courier) {
    var querry = {userId: user._id, read: read};
    var subQuerry = {};
    subQuerry['$exists'] = true;
    querry['media.'+medium] = subQuerry;
    return Herald.collection.find(querry, options);
  };

  //each specifically
  var querry = {userId: user._id, courier: courier, read: read};
  var subQuerry = {};
  subQuerry['$exists'] = true;
  querry['media.'+medium] = subQuerry;
  return Herald.collection.find(querry, options);
  
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
