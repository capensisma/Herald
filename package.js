Package.describe({
  summary: "A Universal Notifications Engine",
  version: "0.8.1",
  git: "https://github.com/Meteor-Reaction/Herald.git",
  name: 'kestanous:herald'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.2');
  api.use(['standard-app-packages', 'artwells:queue@0.0.3']); //TODO: reduce this to the minimum requirements.

  //if iron route is present add 'seen route' logic
  api.use('iron:router@0.9.0', ['server', 'client'], {weak: true}); 
  //if user-status is present add online/idle logic
  api.use('mizzao:user-status@0.6.2',['server', 'client'], {weak: true}); 

  api.addFiles([
    'lib/$herald.js', 
    'lib/collection.js', 
    'lib/couriers.js', 
    'lib/runners.js', 
    'lib/users.js'
  ]);

  api.addFiles('client/startup.js', 'client');

  api.addFiles([
    'server/createNotification.js', 
    'server/escalate.js', 
    'server/publish.js'
  ], 'server');

  api.export(['Notifications', 'Herald']);
});
