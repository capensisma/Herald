#Herald - Universal Notifications

A notifications pattern straight out of Telescope! By itself it supports in app notifications but allows for extension packages that add anything from email to text messages.

#### The current extension packages

* Herald-email ([GitHub](https://github.com/Meteor-Reaction/Herald-email)) - Add email to Harold

## Basic Usage

First a simple example

#### On Client and Sever

```js
Notifications.addCourier('newPost', {
  media: {
    onsite: {} //Send notifications to client, with no custom configuration
  },
  //will be a function on the collection instance, returned from find()/findOne()
  message: function () { return 'There is a new post: "' + this.post.name + '"'; }
});

```

#### On the Server
You can create a new notification on the server with createNotification. 
```js

params = {
  courier: 'newPost', //required
  data: { //optional and whatever you need
    post: { _id: 'id', name: 'New Post' }
  }
};

Notifications.createNotification(userId, params)
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

```js
Template.notifications.notifications = Notifications.collection.find({read: false});
Template.notifications.events({
  'click .item': function (event, template) {
    Notifications.collection.update(this._id, {$set: {read: true} });
  }
});
```


##Overview


#### Meteor Collection 'notifications'

`Notifications.collection` is your notification Meteor Collection. Feel free to use this as you would with any Collection. The only limit is inserts. Client side inserts are denied and you should call `Notifications.createNotification(userId, params)` on the server.

```js
notification = {
  userId //the userId associated with this notification.
  courier //the notification courier. (explained later)
  read //if the notification has been read.
  escalated //if the notification has been escalated.
  timestamp //when the notification was created.
  url //the associated url, if any. (explained later)
  data //anything you need, useful in combo with notification.message().
}
```

You can add a `Notifications.collection.deny` if you would like to be more restrictive on client updates
 
 The built in permissions are:
```js
Notifications.collection.allow({
  insert: function (userId, doc) { return false; },
  update: function (userId, doc) { return userId == doc.userId },
  remove: function (userId, doc) { return userId == doc.userId }
});
```
There is an built in pub/sub 'notifications' that sends notifications down to the client based on the cursor: `Notifications.collection.find({userId:this.userId, onsite: true});`

Currently this package does **not** delete any notifications! You will likely want to do that yourself. I would recommend an observe function on the server removes notifications when they are read.

#### Couriers

Couriers do all the heavy lifting and manage delivery of all the notifications. By default the Couriers insures the notification is delivered to the client browser. When you add extension packages they will also manage your other forms of media.

Your courier must have a name and media, at least one medium. Without an extension package the only medium is `onsite`

#### Runners

Behind the scenes couriers call runners. With the exception of `onsite`, there is one runner per medium. Normal usage of this package will not require you manage the runners but package developers should review the Extension API.


## General API

### addCourier (both)
Call with `Notifications.addCourier(name, object)`

* name - The name of this courier, must be unique
* object - notification parameters
  * metadata - any general data you want added to the notification instance via collection transform
  * message(string) - how to format the notification message. Can be a function, string, or an object.
    * function: will run the function with the notification as its context (this) 
    ```js
      message = function () {return 'message ' + this }
      message() //'message [Object object]'
    ```
    * string: will return a Template with the given name. It will have the notification as its data context.
    ```js
      message = 'example'
      message() //template 'example'
    ```
    * object: can allow for more then one message, the property called will be based on the given string. Running message(string) without an argument will call object.default.
    ```js
      message = object: {
        default: 'example',
        fn: function () {return 'message' }
      }
      message() //template 'example'
      message('fn') //message
    ```

### createNotification (server)
Call with `Notifications.createNotification(userId, object)`

* userId - It accepts ether a user id or an array of user ids. It creates a separate notification for each user. 
* object - notification parameters
  * courier - a string referencing a courier
  * data - any data important to this specific notification, see courier metadata for general data
  * url - if you are using iron:router see `routeSeenByUser`


### markAllNotificationsAsRead (method)
  To set call of the current users notifications to read run `Meteor.call('markAllNotificationsAsRead', [callback])`
  
### routeSeenByUser (if Package iron:router)
  If you have iron:router added to your app you can automatically mark notifications as read based on when a user goes to specific routes. 
  
  Using the above `newPost` courier, lets say you set the notification `url: 'posts/[postId]'` when running `createNotification`. Assuming the route `posts/:postId`, if a user visits that route the appropriate notifications will be marked as read. This operation is currently done only on the client.

## Extension API

### escalate and delayEscalation
 Currently notification escalation is called as soon as the notification is created. The media then call their respective runners. I would like to allow package users to delay this and call later. For example, I would like to check if the user is online and if so delay sending a email for 5 minutes. The assumption being that the user will respond to the in app notification. PRs are welcome ;)

### addRunner
Adding more media and runners is very easy, just call `Notifications.addRunner(name, function(notification, user))`. The function context is media.yourMedium from addCourier.

```js
Notifications.addRunner('yourMedium', function (notification, user) {
  this.example //foo
});

Notifications.addCourier('newPost', {
  media: {
    yourMedium: {
      example: 'foo'
    }
  },
});
```
