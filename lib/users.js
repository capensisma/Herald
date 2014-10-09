//userPrefrence - can be easily overloaded without loss of functionality.
Herald.userPrefrence = function (user, medium, courier) { return getUserPrefrence(user, medium, courier) }


// set user medium preference 
Herald.setUserMediaPreference = function (user, preference) {
  if (!_.isObject(preference)) throw new Error('Herald - getUserPrefrence: no media preference given')
  var badKeys = _.without( _.keys(preference), Herald._media() ) 
  if (badKeys) throw new Error('Herald - getUserPrefrence: '+ badKeys + 'are not valid media')
  
  if (_.isString(user)) {
    user = Meteor.users.findOne(user);
  }
  if (!user) throw new Error('Herald - getUserPrefrence: user not found')

  //not set 
  if (!user.profile) {
    return Meteor.users.update(user._id, {$set: {profile: newProfileMedia(preference)}});
  }
  if (!user.profile.notifications) {
    return Meteor.users.update(user._id, {$set: {'profile.notifications': newProfileMedia(preference).notifications}});
  }
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
}

// set user courier [medium] preference 
Herald.setUserCourierPreference = function (user, courier, preference) {
  if (courier && _.contains(_.keys(Herald._courier), courier))
    throw new Error('Herald - getUserPrefrence: courier "'+courier+'" not found')
  if (!_.isObject(preference)) throw new Error('Herald - getUserPrefrence: no media preference given')
  var badKeys = _.without( _.keys(preference), Herald._media() )
  if (badKeys) throw new Error('Herald - getUserPrefrence: '+ badKeys + 'are not valid media')
  if (_.isString(user)) {
    user = Meteor.users.findOne(user);
  }
  if (!user) throw new Error('Herald - getUserPrefrence: user not found')

  //not set 
  if (!user.profile) {
    return Meteor.users.update(user._id, {$set: {profile: newProfileCouriers(preference)}});
  }
  if (!user.profile.notifications) {
    return Meteor.users.update(user._id, {$set: {'profile.notifications': newProfileCouriers(preference).notifications}});
  }
  if (!user.profile.notifications.couriers) {
    return Meteor.users.update(user._id, {
      $set: {'profile.notifications.couriers': newProfileCouriers(preference).notifications.couriers}
    });
  }


  //merge couriers preferences
  var couriers = user.profile.notifications.couriers;
  _.keys(preference).forEach(function (medium) {
    couriers[medium] = preference[medium]
  });

  return Meteor.users.update(user._id, { $set: {'profile.notifications.couriers': couriers} });

}


// get user [medium [courier]] preference
Herald.getUserPrefrence = function (user, medium, courier) {
  if (!_.isString(medium)) throw new Error('Herald - getUserPrefrence: no medium given')
  if (!_.contains(Herald._media(), medium)) 
    throw new Error('Herald - getUserPrefrence: medium "'+medium+'" not found')
  if (courier && !_.contains(_.keys(Herald._courier), courier))
    throw new Error('Herald - getUserPrefrence: courier "'+courier+'" not found')
  if (_.isString(user)) {
    user = Meteor.users.findOne(user);
  }
  if (!user) throw new Error('Herald - getUserPrefrence: user not found')

  var defaultOutput = Herald.settings.userPrefrenceDefualt
  
  //not set
  if (!user.profile)
    return defaultOutput
  if (!user.profile.notifications)
    return defaultOutput

  //general
  if (!courier && !user.profile.notifications.media)
    return defaultOutput
  if (!courier)
    return user.profile.notifications.media[medium]

  //specific
  if (!user.profile.notifications.couriers)
    return defaultOutput
  if (!user.profile.notifications.couriers[courier])
    return defaultOutput
  return user.profile.notifications.couriers[courier][medium]
  
}

var newProfileMedia = function (media) {
  return { 
    notifications: {
      media: media,
      couriers: {}
    } 
  };
} 

var newProfileCouriers = function (couriers) {
  return { 
    notifications: {
      media: {},
      couriers: couriers
    } 
  };
} 
