Package.describe({
  summary: "A Universal Notifications Engine",
  version: "0.5.2",
  git: "https://github.com/Meteor-Reaction/Herald.git",
  name: 'kestanous:herald'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.2');
  api.use(['standard-app-packages']); //TODO: reduce this to the minimum requirements.

  //if iron route is present add 'seen route' logic
  api.use('iron:router@0.9.0', ['server', 'client'], {weak: true}); 
  //if user-status is present add online/idle logic
  api.use('mizzao:user-status@0.6.2',['server', 'client'], {weak: true}); 

  api.addFiles('lib/notifications.js');

  api.addFiles('lib/client.js', 'client');

  api.addFiles('lib/server.js', 'server');

  api.export(['Notifications', 'Herald']);
});
