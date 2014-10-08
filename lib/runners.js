Herald.addRunner = function (object) {
  if (!_.isObject(object)) throw new Error('Herald: Runner must have an `object` argument');
  if (! _.isString(object.name)) throw new Error('Herald: Runner must medium `name`');
  if (!_.isFunction(object.run)) throw new Error('Herald: Runner must have a `run` function');
  if (!_.isFunction(object.check)) throw new Error('Herald: Runner must have a `check` function');
  if (! (_.isArray(object.where) || _.isString(object.where))) 
    throw new Error('Herald: Runner `where` must be a valid environment');

  var where;
  if (_.isString(object.where))
    where = [object.where]
  else
    where = object.where

  _.each(where, function (where) {
    if (where == 'server')
      Herald._serverRunners[object.name] = object.run
    if (where == 'client')
     Herald._clientRunners[object.name] = object.run
  });

  Herald._runnerCheckers[object.name] = object.check
}


onRun = function () {}
onRun.prototype.run = function () {
  return { command: 'run' }
}

onRun.prototype.delay = function (time) {
  return { command: 'delay', time: time }
}

onRun.prototype.stop = function () {
  return { command: 'stop' }
}

onRun.prototype.transfer = function (name) {
  return { command: 'transfer', name: name }
}


onRunResolve = function (notification, medium, result, run) {
  switch(result.command) {
    case 'run':
      //run true, but invalidation could have been triggered elsewhere so don't change
      break;
    case 'stop':
      run = false
      break;
    case 'delay':
      run = false
      if (Herald._serverRunners[medium]) {
        command = 'Herald.escalate("' + notification._id + '", "' + medium + '")'
        Queue.add({command: command, execute_after: result.time})
      } 
      if (Herald._clientRunners[medium]) {
        var delay = result.time.getTime() - new Date().getTime();
        if (delay < 1000) delay = 1000 //give at least one second for the dust to settle
        var querry = {}
        querry['media.' + medium +'.send'] = true
        Meteor.setTimeout(function () {
          Herald.collection.update(notification._id, {$set: querry})
        }, delay)
      }
      break;
    case 'transfer':
      run = false
      if (!Herald._clientRunners[result.name] && !Herald._serverRunners[result.name])
        throw new Error('Herald: '+ medium +' transfer call - no medium '+ result.name)
      if (Herald._serverRunners[result.name])
        Meteor.call('HeraldTransferMedium', notification._id, medium, result)
      if (Herald._clientRunners[result.name]){
        if (result.time)
          var delay = result.time.getTime() - new Date().getTime();
        else 
          var delay = 1000 //give at least one second for the dust to settle
        var querry = {}
        querry['media.' + result.name] = true
        Meteor.setTimeout(function () {
          Herald.collection.update(notification._id, {$set: querry})
        }, delay)
      }
      break;
    default:
      throw new Error('Herald:' + medium + ' onRun returned the unknown command ' + result.command)
  }
  return run
}

Meteor.methods({
  HeraldTransferMedium: function (notificationId, medium, result) {
    var notification = Herald.collection.findOne(notificationId);
    if (this.userId != notification.userId) throw new Meteor.Meteor.Error(550, 'Herald: permission denied');
    if (!Herald._couriers[notification.courier].media[result.name]) 
      throw new Error('Herald: '+ medium +' transfer call - no medium '+ result.name)
    command = 'Herald.escalate("' + notification._id + '", "' + result.name + '")'
    Queue.add({command: command, execute_after: result.time})
  }
});
