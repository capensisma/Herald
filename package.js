Package.describe({
  summary: "A Universal Notifications Engine",
  version: "0.2.0",
  git: " \* Fill me in! *\ ",
  name: 'kestanous:notifications'
});

Package.onUse(function(api) {
  
  api.use(['standard-app-packages']); //TODO: reduce this to the minimum requirements.

  //if iron route is present add 'seen route' logic
  //if user-status is present add online/idle logic
  api.use(['iron:router', 'mizzao:user-status'], {week: true}); 

  api.addFiles('lib/notifications.js');

  api.addFiles('lib/client.js', 'client');

  api.addFiles('lib/server.js', 'server');

  api.export(['Notifications']);});

});
