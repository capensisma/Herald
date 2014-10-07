Herald.addRunner = function (object) {
  if (!_.isObject(object)) throw new Error('Herald: Runner must have an `object` argument');
  if (! _.isString(object.name)) throw new Error('Herald: Runner must medium `name`');
  if (!_.isFunction(object.run)) throw new Error('Herald: Runner must have a `run` function');
  if (!_.isFunction(object.check)) throw new Error('Herald: Runner must have a `check` function');
  if (! (_.isArray(object.where) || _.isString(object.where))) throw new Error('Herald: Runner `where` must be a valid environment');
  
  //Herald._media.push(object.name) 

  var where;
  if (_.isString(object.where))
    where = [object.where]
  else
    where = object.where

  _.each(where, function (where) {
    if (where == 'server')
      Herald._mediaRunnersServer[object.name] = object.run
    if (where == 'client')
     Herald._mediaRunnersClient[object.name] = object.run
  });

  Herald._mediaCheckers[object.name] = object.check
}
