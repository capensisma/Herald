//get notifications by user, [courier, [[medium]]
Herald.getNotifications = function (query, options) {
  // break function if not finished with logging in
  if(Meteor.isClient && Meteor.loggingIn()){ //this is reactive
    return []; //simulates meteor cursor for Blaze iteration functions
  }

  // check if user exists
  if(!Meteor.userId) {
    throw new Error('Herald - getNotifications: user not found');
  }

  if(!_.isObject(query)) {
    throw new Meteor.Error("Herald getNotifications must contain Mongo filter query");
  }

  var badKeys = _.omit(query, ['user', 'courier', 'medium', 'read']);
  if(!_.isEmpty(badKeys)) {
    throw new Error('Herald - getNotifications: unknown key(s) ' + _.toArray(badKeys))
  }

  var courier = query.courier,
    medium = query.medium,
    read = query.read;


  if(typeof read === "undefined") {
    read = false;
  }

  // check courier
  if(courier && !_.contains(_.keys(Herald._couriers), courier)) {
    throw new Error('Herald - getNotifications: courier "' + courier + '" not found');
  }

  // check medium
  if(medium && !_.contains(Herald._media(), medium)) {
    throw new Error('Herald - getNotifications: medium "' + medium + '" not found');
  }

  var filter = {userId: Meteor.userId, read: read};
  if(medium) {
    filter['media.' + medium] = {$exists: true};
  }
  if(courier) {
    filter['courier'] = courier;
  }

  return Herald.collection.find(filter, options);
};