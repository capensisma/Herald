#Herald - Universal Notifications
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/Meteor-Reaction/Herald?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

###### This readme is for v1.0.0-pre1! 

A notifications pattern straight out of Telescope!

Herald lets you easily send messages to any number of recipients via any courier included within your app by simply supplying the courier, recipient list, and data.

The message data will be transmitted via all media (email, in-app-messaging, and/or other) common to both the courier and each recipient's preferences. Additionally, the courier will properly format each message's data appropriate to the media being utilized. (user preferences not yet officially supported)

#### The current extension packages

* [Herald-email](https://atmospherejs.com/kestanous/herald-email) ([GitHub](https://github.com/Meteor-Reaction/Herald-email)) - Add email to Harold
* [Herald-Web-Notifications](https://atmospherejs.com/kestanous/herald-web-notifications) ([GitHub](https://github.com/Meteor-Reaction/Herald-Web-Notifications)) - Add Web Notifications to Harold

#### Useful additional packages

* [meteorhacks:ssr](https://atmospherejs.com/meteorhacks/ssr) ([GitHub](https://github.com/meteorhacks/meteor-ssr)) - Templates just work on server, works with `message()`!
* [artwells:queue](https://atmospherejs.com/artwells/queue) ([GitHub](https://github.com/artwells/meteor-queue)) -  used to queue server-side media (e.g. email)

## Basic Usage

First a simple example (also see the [example app](https://github.com/Meteor-Reaction/Herald-Example))

#### On Client and Sever

First define your courier. Don't worry to much about this when you getting started. Couriers are a lot like classes. You can add quite a lot of complex logic to them or keep them very simple and generic. In this example the courier will only send messages `onsite` (in app notifications). `onsite` does not take any optional arguments we can just pass it an empty object. It also provides an optional pre-formatted message. 

```js
Herald.addCourier('newPost', {
  media: {
    onsite: {} //Send notifications to client, with no custom configuration
  },

  //will be a function on the collection instance, returned from find()
  message: function () { 
    return 'There is a new post: "' + this.data.post.name + '"'; 
  }
});

```

#### On the Server
You can create a new notification on the server with createNotification. This is what actually creates the notification. It calls on the courier `newPost` to figure out what metadata it needs. When it's saved in the database, the courier will be sure to deliver it via the appropriate media. In this case `onsite`, so it will be sent to the client for in app display. 

```js

params = {
  courier: 'newPost', //required
  data: { //optional and whatever you need
    post: { _id: 'id', name: 'New Post' }
  }
};

Herald.createNotification(userId, params)
```
#### On the Client

Currently there is no prebuilt templates, but creating your own is easy

```html
<template name='notifications'>
  <div class='list'>
    {{#each notifications}}
      <div class='item'>
        {{this.message}} <!-- Blaze will call the function -->
      </div>
    {{/each}}
  </div>
</template>
```

There can be other types of notifications on the client and you may not want to display them. It's best practices to always define the notifications you wish to display as `onsite`. We can easily get the appropriate notifications with `Herald.getNotification`. By default herald only publishes notifications, to the client, that have not been read.

```js
Template.notifications.notifications = Herald.getNotifications({medium: 'onsite'});

Template.notifications.events({
  'click .item': function (event, template) {
    Herald.collection.update(this._id, {$set: {read: true} });
  }
});
```


##Overview


#### Media (medium)

In this package media refers to the many types formats that you can use transmit messages. Most common examples would be in-app-notifications and Emails. In the future I hope to expand this list to include things like push notifications and text messages. For reference, media is plural for medium.

#### Couriers

Couriers do all the heavy lifting and manage delivery of all the notifications. By default the Couriers have `onsite`, which insures the notification is delivered to the client browser. When you add extension packages they will also manage your other forms of media.

Your courier must have a name, that you reference when creating and finding notifications. You also must have at least one medium. Without an extension package the only medium is `onsite`.

Couriers can also add static properties and functions to notifications via the transform property. This is applied directly to the notification via the `Meteor.Collection` transform.

Lastly Couriers have an `onRun` function that gives you fine control over when and where the notifications are delivered. This is for advanced usage only.

#### Runners

Behind the scenes couriers call runners. There is one runner per medium. Normal usage of this package will not require you manage the runners but package developers should review the Extension API.

#### Meteor Collection 'notifications'

`Herald.collection` is your notification Meteor Collection. While `Herald.getNotifications` is the easiest to use, feel free to use this as you would with any Collection. The only limit is inserts. Client side inserts are denied and you should call `Herald.createNotification(userId, params)` on the server. 


```js
notification = {
  //required
  userId //the userId associated with this notification.
  courier //the notification courier. (explained later)

  //optional
  data //anything you need, useful in combo with notification.message().
  url //the associated url, if any. (explained later)

  //auto-generated & possibly auto-updated
  read //if the notification has been read.
  timestamp //when the notification was created.
  escalated //if the notification has been escalated.
  media //send & sent status for each medium
}
```

You can add a `Herald.collection.deny` if you would like to be more restrictive on client updates. The built in permissions are:

```js
Herald.collection.allow({
  insert: function (userId, doc) { return false; },
  update: function (userId, doc) { return userId == doc.userId },
  remove: function (userId, doc) { return userId == doc.userId }
});
```
There is a built in pub/sub('notifications') that sends notifications down to the client. It sends down all the client-side notifications that have not been read, have not been sent, and should be sent. (`onsite` is always marked as should send and has not been sent)

#### Cleanup
Currently this package does **not** delete any notifications! You will likely want to do that yourself. I would recommend an observe function on the server to removes notifications when they are read.

## General API

### addCourier (both)

You should define your courier on both the server and the client. The following is an example of a courier with all the available options. The only required ones are the name and the media. 

```js

//Herald.addCourier(name, object)

Herald.addCourier(name, {
  media: { 
    medium: {} 
  },
  message: function () { return String }, 
  transform: {}
});

```

##### name (string) [required]
  
The name of this courier, must be unique. This should be descriptive of how you want to use this courier. If is a general courier for `onsite` notifications you could call it `inAppCourier`. However its more likely that you will want to have custom messages and transform functions. For example if you are notifying users of comments on a blog you may want to call it `newComment`.

##### media (object) [required]

This object should list each medium you wish to use along with any medium specific configurations. `onsite` does not have any configurations so you can just pass it an empty object. Each extension package will detail what kind of configurations you can use. Here is an example with `onsite` and `webNotifications`:

```js
media: {
  onsite: {},
  webNotifications: {
    title: 'hello from the web',
    body: function () {
      return this.message();
    }
  }
}
```
###### A note on onRun and fallback

In addition to configuration you can also add `onRun` and `fallback` to your medium objects. For more details see the [onRun](#onrun-advanced-usage-only) section.

```js
//not a functional example, simplified for readability
media: {
  webNotifications: {
    onRun: function () {
      if (userIsOfline)
        return this.transfer('email');
      else
        return this.run()
    }
  },
  email: {
    fallback: true
  }
}
```

##### message ( function || string || object) 

  The courier also comes with an optional message tool. This will be available on the notification instance. You can pass a function, string, or an object. For a simple use cases you will likely just use the function option.
 
  * function 
  
  The function will run with the notification instance as its context (this)

  ```js
  {
    message: function () {return 'post: ' + this.data.post.name }
  {

  instance.message() //'post: postName'
  ```
  * string 
  
  A string be read as a Template name. Herald will return a live Blaze view when you call the message. It will have the notification as its data context.

  ```js
  {
    message: 'example'
  }
  instance.message() //the template 'example'
  ```
  * object
  
  You can usage an object to allow for more then one message. The property called will be based on the message function argument string. Running message() without an argument will call object.default.
  ```js
  {
    message: object: {
      default: 'example',
      fn: function () {return 'message' }
    }
  }
  instance.message() //template 'example'
  instance.message('fn') //message
  ```

##### transform 
  Any **static** data or functions you want added to the notification instance via collection transform. Much like the message function option each function will be called with the notification as its `this` context. 
  ```js
  {
    transform: {
      name: function () {
        return this.courier;
      }
    }
  }
  instance.name() // 'courierName'
  ```


### createNotification (server)
Call with `Herald.createNotification(userId, object)`

* userId - It accepts ether a user id or an array of user ids. It creates a separate notification for each user.
* object - notification parameters
  * courier - a string referencing a courier
  * data - any data important to this specific notification, see courier metadata for general data
  * url - if you are using iron:router see `routeSeenByUser`

### getNotification (both)

### markAllAsRead (method)
  To set call of the current user's notifications to read run `Meteor.call('heraldMarkAllAsRead')`

### routeSeenByUser (if Package iron:router)
  If you have iron:router added to your app you can automatically mark notifications as read based on when a user goes to specific routes.

  Using the above `newPost` courier, lets say you set the notification `url: 'posts/[postId]'` when running `createNotification`. Assuming the route `posts/:postId`, if a user visits that route the appropriate notifications will be marked as read. This operation is currently done only on the client.

## User Preferences API

### userPrefrence

### getUserPrefrence

### setUserMediaPreference

### setUserCourierPreference

## Herald settings and artwells:queue

## onRun [advanced usage only]
medium.onRun (function) 

## Extension API

### escalate and delayEscalation
 Currently notification escalation is called as soon as the notification is created. The media then call their respective runners. I would like to allow package users to delay this and call later. For example, I would like to check if the user is online and if so delay sending a email for 5 minutes. The assumption being that the user will respond to the in app notification. PRs are welcome ;)

### addRunner
Adding more media and runners is very easy, just call `Herald.addRunner(object)`.

* object.name (string) - the name of the new medium
* object.run (function) - The function context is media.yourMedium from addCourier. From here you can do things like Email.send()
* object.check (function) - The function context is media.yourMedium from addCourier. Runs for every courier and lets you check to make sure their media.yourMedium definition is valid
* object.where (string || array) - a string or array of strings listing the target environment, server or client.

```js
var runner = {
  name: 'yourMedium',
  where: ['server']
}
runner.run = function (notification, user) {
  this.example; //foo
}

runner.check = function (notification, user) {
  if (!this.example)
    throw new Error('Herald-MyMedium : example must be defined for `myMedium`')
}

Herald.addRunner(runner);

Herald.addCourier('newPost', {
  media: {
    yourMedium: {
      example: 'foo'
    }
  },
});
```
