Package.describe({
  summary: "A Universal Notifications Engine",
  version: "0.4.0",
  git: "https://github.com/Meteor-Reaction/harold.git",
  name: 'kestanous:harold'
});

Package.onUse(function(api) {
  
  api.use(['standard-app-packages']); //TODO: reduce this to the minimum requirements.

  //if iron route is present add 'seen route' logic
  api.use('iron:router', {week: true}); 
  //if user-status is present add online/idle logic
  api.use('mizzao:user-status', {week: true}); 

  api.addFiles('lib/notifications.js');

  api.addFiles('lib/client.js', 'client');

  api.addFiles('lib/server.js', 'server');

  api.export(['Notifications']);
});
