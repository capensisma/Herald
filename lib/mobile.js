var runner = {
  name: 'mobile',
  where: ['client']
};
runner.run = function (notification, user) {};
runner.check = function () {};
Herald.addRunner(runner);
