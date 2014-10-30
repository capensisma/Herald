Package.describe({
  summary: "A Universal Notifications Engine",
  version: "1.0.1",
  git: "https://github.com/Meteor-Reaction/Herald.git",
  name: 'kestanous:herald'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.2');
  api.use(['underscore', 'tracker','accounts-base', 'blaze', 'artwells:queue@0.0.3']);

  //if iron route is present add 'seen route' logic
  api.use('iron:router@0.9.0 || 1.0.0', ['server', 'client'], {weak: true}); 

  api.addFiles([
    'lib/$herald.js', 
    'lib/collection.js', 
    'lib/couriers.js', 
    'lib/runners.js', 
    'lib/users.js',
    'lib/onsite.js',
    'lib/helpers.js'
  ]);

  api.addFiles(['client/startup.js', 'client/escalate.js'], 'client');

  api.addFiles([
    'server/createNotification.js', 
    'server/escalate.js', 
    'server/publish.js'
  ], 'server');

  api.export(['Herald']);
});
