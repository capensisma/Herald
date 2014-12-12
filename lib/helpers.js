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
    read = query.read || false;

  // get user
  var user = Herald._getUser.call(this, userId);

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

  var query = { userId: user._id, read: read };
  if (medium) {
    query['media.' + medium] = { $exists: true };
  }
  if (courier) {
    query['courier'] = courier;
  }

  return Herald.collection.find(query, options);
};

//literally mark-All-As-Read, cheers :)
Meteor.methods({
  heraldMarkAllAsRead: function () {
    Herald.collection.update({ userId: this.userId }, {
      $set: { read: true }
    }, { multi: true });
  }
});
