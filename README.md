#Herald - Universal Notifications
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/Meteor-Reaction/Herald?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

###### This readme is for v1.0.0. Pre-1 versions are not considered stable. 

A notifications pattern straight out of Telescope!

Herald lets you easily send messages to any number of recipients via any courier included within your app by simply supplying the courier, recipient list, and data.

The message data will be transmitted via all media (email, in-app-messaging, and/or other) common to both the courier and each recipient's preferences. Additionally, the courier will properly format each message's data appropriate to the media being utilized.

#### The current extension packages

* [Herald-Email](https://atmospherejs.com/kestanous/herald-email) ([GitHub](https://github.com/Meteor-Reaction/Herald-email)) - Add email to Harold
* [Herald-Web-Notifications](https://atmospherejs.com/kestanous/herald-web-notifications) ([GitHub](https://github.com/Meteor-Reaction/Herald-Web-Notifications)) - Add Web Notifications to Harold

#### Useful additional packages

* [meteorhacks:ssr](https://atmospherejs.com/meteorhacks/ssr) ([GitHub](https://github.com/meteorhacks/meteor-ssr)) - Templates just work on server, works with `message()`!
* [artwells:queue](https://atmospherejs.com/artwells/queue) ([GitHub](https://github.com/artwells/meteor-queue)) -  used to queue server-side media (e.g. email)

## Basic Usage

First, a simple example: (also see the [example app](https://github.com/Meteor-Reaction/Herald-Example))

#### On Client and Sever

Define your courier. Don't worry to much about this when you getting started. Couriers are a lot like classes. You can add complex logic to them or keep them simple and generic. In this example the courier will only send messages `onsite` (in app notifications). `onsite` does not take any optional arguments, you can just pass it an empty object. This courier also provides an optional pre-formatted message. 

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
You can create a new notification on the server with createNotification. This is what actually creates the notification. It calls on the courier `newPost` to determine what metadata it needs. When saved to the database, the courier will deliver it via the appropriate media - in this case `onsite`, so it will be sent to the client for in app display. 

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

As of this writing there are no prebuilt templates, but creating your own is easy:

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

There can be other types of notifications on the client, and you may not want to display them. As Herald is always aware of `onsite` it is best practice to define the notifications you wish to display as `onsite`. Ergo, you can easily get appropriate notifications with `Herald.getNotification`. By default Herald only publishes notifications that have not been read.

```js
Template.notifications.notifications = Herald.getNotifications({medium: 'onsite'});   // Preventing unwanted media

Template.notifications.events({
  'click .item': function (event, template) {
    Herald.collection.update(this._id, {$set: {read: true} });
  }
});
```


##Overview


#### Medium

In this package medium refers to the many formats that you can use transmit messages. Common examples are in-app-notifications and Email. In the future I hope to expand this list to include things like push notifications and text messages.

#### Couriers

Couriers do all the heavy lifting and manage delivery of all the notifications. By default the Couriers have `onsite`, which insures the notification is delivered to the client browser. When you add extension packages they will also manage your other forms of media.

Your courier must have a name, that you reference when creating and finding notifications. You also must have at least one medium. Without an extension package the only medium is `onsite`.

Couriers can also add static properties and functions to notifications via the transform property. This is applied directly to the notification via the `Meteor.Collection` transform.

Lastly Couriers have an `onRun` function that gives you fine control over when and where the notifications are delivered. This is for advanced usage only.

#### Runners

Behind the scenes couriers call runners. There is one runner per medium. Normal usage of this package will not require you manage the runners but package developers should review the Extension API.

#### Meteor Collection 'notifications'

`Herald.collection` is your notification Meteor Collection. While `Herald.getNotifications` is the easiest to use, feel free to use this as you would any Collection. The only limit is inserts; client side inserts are denied and you should call `Herald.createNotification(userId, params)` on the server. 


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

You can add a `Herald.collection.deny` to be more restrictive on client updates. The built-in permissions are:

```js
Herald.collection.allow({
  insert: function (userId, doc) { return false; },
  update: function (userId, doc) { return userId == doc.userId },
  remove: function (userId, doc) { return userId == doc.userId }
});
```
There is a built-in pub/sub ('notifications') that delivers notifications to the client. It sends down all the client-side notifications that have not been read, have not been sent, and should be sent (`onsite` is always marked as should send and has not been sent).

#### Cleanup
Currently this package does **not** delete any notifications! You will likely want to do that yourself. I would recommend an observe function on the server to remove notifications when they are read, or use age-based cleanup.

## General API

### addCourier (Server and Client)

You should define your courier on both the server and the client. The following is an example of a courier with all the available options. Name and media are required. 

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
  
The name of this courier must be unique. This should be descriptive of how you want to use this courier, e.g. a general courier for `onsite` notifications could be called `inAppCourier`. However its more likely that you will want to have custom messages and transform functions. For example if you are notifying users of comments on a blog you may want to call it `newBlogComment`.

##### media (object) [required]

This object should list each medium you wish to use along with any medium specific configurations. `onsite` does not have any configuration so you can just pass it an empty object. Each extension package will detail what kind of configuration you can use. Here is an example with `onsite` and `webNotifications`:

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

In addition to configuration you can also add `onRun` and `fallback` to your media. For more details see the [onRun](#onrun-advanced-usage-only) section.

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

##### Message ( function || string || object) 

The courier also comes with an optional message tool, available on the notification instance. You can pass a function, string, or an object. For simple use cases you will likely just use the function option.
 
  * Function 
  
  The function will run with the notification instance as its context (this)

  ```js
  {
    message: function () {return 'post: ' + this.data.post.name }
  }

  instance.message() //'post: postName'
  ```
  * String 
  
A string to be read as a Template name. Herald will return a live Blaze view when you call the message. It will have the notification as its data context.

  ```js
  {
    message: 'example'
  }
  instance.message() //the template 'example'
  ```
  * Object
  
You can use an object to allow for more then one message. The property called will be based on the message's function's argument string. Running message() without an argument will call object.default.

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

##### Transform 

Any **static** data or functions you want added to the notification instance via its collection's transform. Much like the message function option each function will be called with the notification's `this` context. 

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
  
### createNotification (Server)

You should create all your notifications with `Herald.createNotification`. This function creates notifications and delivers them to the courier to manage. Note that this can only be done on the server.

```js
//Herald.createNotification(userId, object)
Herald.createNotification(userId, {
  courier: String,
  data: Object,
  url: String
})
```

##### userId 

This can be a user id or an array of user ids. A separate notification will be created for each user.

##### courier 
  
A string name referencing a courier.

##### data (object)

Any data important to this specific notification. This is usually things like a collection _id and other fields. It must be in object form. This will be saved in the database so be sparse for database efficiency. You can use the courier transform to save static data.

##### url (sting)

This is optional but is used by a number of tools. For example, if you are using iron:router it can automatically mark the notification as read. See [routeSeenByUser](#routeseenbyuser-if-package-ironrouter).

### getNotification (Server and Client)

`Herald.getNotifications(query, options)` is a light wrapper around Meteor.Collection.find(). You can pass an object query with [collection find options](http://docs.meteor.com/#find), and it will return a cursor.

The query can have any of the following: 
```js
{
  user: _id, //required
  courier: 'name', 
  medium: 'medium name', 
  read = boolean //default false
}
```
This will always scope the search to a user id and read state. If you need more control then you can use `Herald.collection.find()`

### heraldMarkAllAsRead (method)

To set all of the current user's notifications as read, run `Meteor.call('heraldMarkAllAsRead')`

### Route Detection (if Package iron:router)

If you have iron:router added to your app you can automatically mark notifications as read when a user arrives at specific routes.

For example, when using the [above 'newPost' courier](#basic-usage), let's say you set the notification `url: 'posts/[postId]'` when running `createNotification`. Assuming the route `posts/:postId`, if a user visits that route the appropriate notifications will be marked as 'read'. 

The read url operation is currently done only on the client.

## User Preferences API

Herald looks at `user.profile.notifications` to identify users preferences. If the boolean is set to `true` then herald will send the notification. If the user's preferences have not been set then Herald defaults to true. You can change this default in [Herald.settings](#herald-settings-and-artwellsqueue)

```js
user.profile.notifications {
  media: {
    onsite: boolean,
    email: boolean
  },
  couriers: {
    newPost: {
      onsite: boolean,
      email: boolean
    }
  }
}
```
While you can manage user preferences yourself, Herald provides some helper functions to make this easier.

### getUserPreference

Herald.userPreference(user, medium, courier) returns true if the user allows given medium

##### user
Can be null, user id, or user. Will fetch current user if null.

##### medium (required)
Must be the name of a medium

##### courier 
The name of a courier. Will check if user has set preferences on this courier. If not it defaults to generic medium preferences.

### setUserPreference

```js
var preferences = {
  onsite: true, //send onsite
  email: false //don't send email
}
Herald.setUserMediaPreference(user, preferences, courier) 
```

##### user

Can be undefined, a user object or the user id. Herald will fetch the current user if undefined.

##### preferences (required)

An object listing the users preferences on the given media. True for send, false for don't send.

##### courier

An optional argument. If undefined it will set the general user preferences. If it is the name of a courier then it will set the preferences specifically for that courier. General preferences do not have to be defined for these preferences to be respected.

### userPreference

The only user preference function Herald calls is `Herald.userPreference()`. This just points to to `Herald.getUserPreference`. If you want to provide you own user preferences you can simply overload this function:

```js
Herald.userPreference = function (user, medium, courier) {
  //user is always given
  //medium is always given
  //courier may be given.  
  return boolean;
}
```

If courier is given the request is asking if the user allows this medium for this courier.

## Herald settings and artwells:queue

Herald has a few settings that make development easier. You can set these at `Herald.settings`.

```js
Herald.settings = {
  overrides: { //disable given medium for all users. 
    example: true //example medium would not be sent
  }, 
  queueTimer: 60000, //run server queue once every minute
  userPreferenceDefault: true, //send notifications unless the user has disabled
  collectionName: 'notifications', //override herald collection name, must be set before meteor startup
  useIronRouter: true, //use iron:router if available
  expireAfterSeconds: 0 //automatically delete notifications after some time. Specify 0 (default) for no expiration
}
```

Herald uses [artwells:queue](https://github.com/artwells/meteor-queue) to manage server side async sending of notifications. All of the queue's default settings remain. Herald calls `Queue.run()` once every minute, unless `Herald.settings.queueTimer` has been changed. While developing you may wish to set that timer to 5 or 10 seconds.

##### A note on Herald.settings.expireAfterSeconds:

Use this setting with care. Under the hood, Herald just builds a TTL index on the timestamp value. This means that every time the setting is changed, a new index is built -- you have to manually teardown existing indexes on the timestamp. Also, beware of changing this value when your notification collection is big, since building an index on a large collection is a slow process. As a precaution, Herald attempts to verify that the collection is empty before creating the index.

## onRun [advanced usage only, experimental]

Every courier calls the onRun function before sending a notification on a medium. The function called will have a `this` context with four functions. The return value of onRun must be the result of one of these four functions.

```js
Herald.addCourier(name, {
  media: { 
    medium: {
      onRun: function () {
        return this.run() //if called you must return one of the functions
      }
    }
  }
});
```

##### run

`this.run()` tells the courier to send the notification. It has no arguments.

##### stop

`this.stop()` tells the courier not to send the notification. It has no arguments.

##### delay

`this.delay(time)` tells the courier to wait to send the notification on this medium. The time argument must be an instance of the native `Date` object. If the amount of time from now to the date is less then one second (including negative time) then delay will default to 1 second. 

Note: The real time delay depends on many factors and may be longer then the give time. This is especially true for server side delays as Herald will wait until the next `Queue.run()` call.

**DANGER:** endless looping is possible! This will also cause numinous database writes for every delay.

##### transfer

`this.transfer(medium, time)` tells the courier to send the notification on a different medium. The medium must already be defined on the courier. If the notification has already been sent medium on that medium then nothing will be sent.

The time arguement is the same as `this.delay`. If undefined it will default to 1 second.

**DANGER:** endless looping between media is possible! This will also cause numinous database writes for every transfer.

## Extension API

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

##Notes

My usage of the noun forms of medium (singular) and media (plural for medium) is explained in here:  http://grammar.about.com/od/alightersideofwriting/a/mediagloss.htm
