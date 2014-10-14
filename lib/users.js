//userPreference - can be easily overloaded without loss of functionality.
Herald.userPreference = function (user, medium, courier) { return Herald.getUserPreference(user, medium, courier) }


// set user medium preference 
Herald.setUserPreference = function (user, preference, courier) {

  if (courier && !_.contains(_.keys(Herald._couriers), courier)) //optional and check
    throw new Error('Herald - getUserPreference: courier "'+courier+'" not found')

  if (!_.isObject(preference)) throw new Error('Herald - getUserPreference: no media preference given')
  var badKeys = _.omit(preference, Herald._media() ) 
  if (!_.isEmpty(badKeys)) throw new Error('Herald - getUserPreference: "'+ _.toArray(badKeys) + '" are not valid media')
  
  if (_.isString(user)) {
    user = Meteor.users.findOne(user);
  } else if (!_.isObject(user)) {
    if (Meteor.isClient) 
      user = Meteor.user();
    else
      user = Meteor.users.findOne(this.userId);
  }
  if (!user || !user._id) throw new Error('Herald - setUserPreference: user not found')

  //not set 
  if (!user.profile) {
    return Meteor.users.update(user._id, {$set: {profile: newProfileMedia(preference)}});
  }
  if (!user.profile.notifications) {
    return Meteor.users.update(user._id, {$set: {'profile.notifications': newProfileMedia(preference).notifications}});
  }


  if (!courier) { //generic only

    if (!user.profile.notifications.media) {
      return Meteor.users.update(user._id, {
        $set: {'profile.notifications.media': newProfileMedia(preference).notifications.media}
      });
    }

    //merge medium preferences
    var media = user.profile.notifications.media;
    _.keys(preference).forEach(function (medium) {
      media[medium] = preference[medium]
    });

    return Meteor.users.update(user._id, { $set: {'profile.notifications.media': media} });
  } //generic only end


  //for courier set only 
  if (!user.profile.notifications.couriers || !user.profile.notifications.couriers[courier]) {
    var query = {}
    query['profile.notifications.couriers.' + courier] = preference;
    return Meteor.users.update(user._id, { $set: query });
  }
  //merge couriers preferences
  var pref = user.profile.notifications.couriers[courier];
  _.keys(preference).forEach(function (medium) {
    pref[medium] = preference[medium]
  });
  var query = {}
  query['profile.notifications.couriers.' + courier] = pref;
  return Meteor.users.update(user._id, { $set: query });

}

// get user [medium [courier]] preference
Herald.getUserPreference = function (user, medium, courier) {
  if (!_.isString(medium)) throw new Error('Herald - getUserPreference: no medium given')
  if (!_.contains(Herald._media(), medium)) 
    throw new Error('Herald - getUserPreference: medium "'+medium+'" not found')
  if (courier && !_.contains(_.keys(Herald._couriers), courier))
    throw new Error('Herald - getUserPreference: courier "'+courier+'" not found')
  
  if (_.isString(user)) {
    user = Meteor.users.findOne(user);
  } else if (!_.isObject(user)) {
    if (Meteor.isClient) 
      user = Meteor.user();
    else
      user = Meteor.users.findOne(this.userId);
  }

  if (!user || !user._id) throw new Error('Herald - getUserPreference: user not found')

  var defaultOutput = Herald.settings.userPreferenceDefault
  
  //not set
  if (!user.profile)
    return defaultOutput
  if (!user.profile.notifications)
    return defaultOutput

  var useCourier = false; //assume not set, skip

  if (courier) useCourier = true; //set, don't skip

  if (useCourier) {
    if (!user.profile.notifications.couriers)
      useCourier = false //not set, skip
    if (useCourier && !user.profile.notifications.couriers[courier])
      useCourier = false //not set, skip
    if (useCourier && user.profile.notifications.couriers[courier].hasOwnProperty(medium)) {//skip?
      return user.profile.notifications.couriers[courier][medium];
    }
  }
  //general
  if (!user.profile.notifications.media){
    return defaultOutput
  }
  if (user.profile.notifications.media.hasOwnProperty(medium))
    return user.profile.notifications.media[medium]
  else
    return defaultOutput
}

var newProfileMedia = function (preferences) {
  return { 
    notifications: {
      media: preferences,
      couriers: {}
    } 
  };
} 

var newProfileCouriers = function (courier, preferences) {
  var obj = { 
    notifications: {
      media: {},
      couriers: {}
    } 
  };
  obj.notifications.couriers[courier] = preferences
  return obj;
} 
