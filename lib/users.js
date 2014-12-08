//userPreference - can be easily overloaded without loss of functionality.
Herald.userPreference = function (user, medium, courier) { return Herald.getUserPreference(user, medium, courier); };

// set user medium preference 
Herald.setUserPreference = function (user, preference, courier) {
  if (courier && !Herald._getCourier(courier)) //optional and check
    throw new Error('Herald - getUserPreference: courier "' + courier + '" not found')

  if (!_.isObject(preference)) throw new Error('Herald - getUserPreference: no media preference given');
  var badKeys = _.omit(preference, Herald._media()); 
  if (!_.isEmpty(badKeys)) throw new Error('Herald - getUserPreference: "' + _.toArray(badKeys) + '" are not valid media');
  
  user = Herald._getUser.call(this, user);
  if (!user || !user._id) throw new Error('Herald - setUserPreference: user not found');

  //not set 
  if (!user.profile) {
    return Meteor.users.update(user._id, { $set: { profile: newProfileMedia(preference) } });
  }
  if (!user.profile.notifications) {
    return Meteor.users.update(user._id, { $set: { 'profile.notifications': newProfileMedia(preference).notifications } });
  }

  if (!courier) { // generic only
    var media = user.profile.notifications.media;
    // if media preference is set, merge medium preferences. otherwise, create new preference
    var media = media ? _.extend(media, preference) : newProfileMedia(preference).notifications.media;
    return Meteor.users.update(user._id, { $set: { 'profile.notifications.media': media } });
  } // generic only end

  var pref = Herald._getCourier(courier, user.profile.notifications.couriers);
  // if courier is set, merge courier preferences. otherwise use preference
  var pref = pref ? _.extend(pref, preference) : preference;

  var query = Herald._setProperty('profile.notifications.couriers.' + courier, pref);
  return Meteor.users.update(user._id, { $set: query });
}

// get user [medium [courier]] preference
Herald.getUserPreference = function (user, medium, courier) {
  if (!_.isString(medium)) throw new Error('Herald - getUserPreference: no medium given');
  if (!_.contains(Herald._media(), medium)) 
    throw new Error('Herald - getUserPreference: medium "' + medium + '" not found')
  if (courier && !Herald._getCourier(courier))
    throw new Error('Herald - getUserPreference: courier "' + courier + '" not found')
  
  user = Herald._getUser.call(this, user);
  if (!user || !user._id) throw new Error('Herald - getUserPreference: user not found')

  var defaultOutput = Herald.settings.userPreferenceDefault;
  
  //not set
  if (!user.profile || !user.profile.notifications) return defaultOutput;

  return (function (pref, courier) {
    var courier = courier && Herald._getCourier(courier, pref.couriers);

    if (courier && _.has(courier, medium)) { 
      return courier[medium];
    }
    //general
    if (pref.media && _.has(pref.media, medium)) {
      return pref.media[medium];
    }

    return defaultOutput;
  })(user.profile.notifications, courier);
}

var newProfileMedia = function (preferences) {
  return { 
    notifications: {
      media: preferences,
      couriers: {}
    } 
  };
}; 

var newProfileCouriers = function (courier, preferences) {
  return { 
    notifications: {
      media: {},
      couriers: Herald._setProperty(courier, preferences)
    } 
  };
}; 
