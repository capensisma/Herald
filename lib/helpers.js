//get notifications by user, [courier, [[medium]]
Herald.getNotifications = function (query, options) {
  // break function if not finished with logging in
  if (Meteor.isClient && Meteor.loggingIn()) {
    return [];
  }

  if (!_.isObject(query)) {
    throw new Meteor.Error('Herald getNotifications must contain Mongo filter query');
  }

  var badKeys = _.omit(query, ['user', 'courier', 'medium', 'read']);
  if (!_.isEmpty(badKeys)) {
    throw new Error('Herald - getNotifications: unknown key(s) ' + _.toArray(badKeys))
  }

  var userId = query.user,
    courier = query.courier,
    medium = query.medium,
    read = query.read,
    user;

  if (typeof read === 'undefined') {
    read = false;
  }

  // get user
  if (_.isString(userId)) {
    user = Meteor.users.findOne(userId);
  } 
  else if (!_.isObject(userId)) {
    user = Meteor.isClient ? Meteor.user() : Meteor.users.findOne(this.userId);
  }

  // check if user exists
  if (!user || !user._id) {
    throw new Error('Herald - getNotifications: user not found');
  }

  // check courier
  if (courier && !Herald._getCourier(courier)) {
    throw new Error('Herald - getNotifications: courier "' + courier + '" not found');
  }

  // check medium
  if (medium && !_.contains(Herald._media(), medium)) {
    throw new Error('Herald - getNotifications: medium "' + medium + '" not found');
  }

  var filter = { userId: user._id, read: read };
  if (medium) {
    filter['media.' + medium] = { $exists: true };
  }
  if (courier) {
    filter['courier'] = courier;
  }

  return Herald.collection.find(filter, options);
};

//literally mark-All-As-Read, cheers :)
Meteor.methods({
  heraldMarkAllAsRead: function () {
    Herald.collection.update({ userId: this.userId }, {
      $set: { read: true }
    }, { multi: true });
  }
});
