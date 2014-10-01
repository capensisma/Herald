#Universal Notifications

A notifications pattern straight out of Telescope! By itself it supports in app notifications but allows for extension packages that add anything from email to text messages.

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

#### Couriers

Couriers do all the heavy lifting and manage delivery of all the notifications. By default the Couriers insures the notification is delivered to the client browser. When you add extension packages they will also manage your other forms of media.

Your courier must have a name and media, at least one medium. Without an extension package the only medium is `onsite`

#### Runners

Behind the scenes media call runners. With the exception of `onsite`, there is one runner per medium. Normal usage of this package will not require you manage the runners but package developers should review the runner API.
