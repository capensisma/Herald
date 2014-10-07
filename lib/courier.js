Herald.addCourier = function (key, options) {
  check(key, String);
  if (Herald._courier[key]) 
    throw new Error('Herald: courier "' + key + '"" already exists');

  check(options, Object);
  Herald._courier[key] = {
    messageFormat: options.message
  };

  //media is required but should only throw exceptions on the server, where it is needed.
  if (Meteor.isServer) {
    check(options.media, Object);
    var media = _.keys(options.media)
    if (media.length == 0)
      throw new Error('Herald: courier "'+ key + '" must have at least one medium');
    media.forEach(function (medium) {
      if (!_.contains(Herald._media(), medium)) 
        throw new Error('Herald: medium "' + medium + '" is not a known media');
      if (medium != 'onsite')
        Herald._mediaCheckers[medium].apply(options.media[medium])
    });
  }
  //define on both
  Herald._courier[key].media = options.media

  if (options.metadata) {
    console.warn('Herald: metadata is depreciated, use transform');
    metadata: options.metadata;
  };
  Herald._courier[key].transform = options.transform;

  //white-listed params from extension packages
  _.extend(Herald._courier[key], _.pick(options, Herald._extentionParams)) 
}
