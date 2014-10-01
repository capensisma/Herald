#### THIS README IS OUT OF DATE.... AGAIN!

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

Currently there no no prebuilt templates but creating your own is easy

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
Template.notifications.notifications = Notifications.collection.find();
Template.notifications.events({
  'click .item': function (event, template) {
    Notifications.collection.update(this._id, {$set: {read: true} });
  }
});
```


##Current Features


#### Couriers

You will want to set up a courier. Couriers do all the heavy lifting and manage delivery of all the notifications. Without an extension package the Couriers insures the notification is delivered to the client browser. When you add extension packages they will also manage your other forms of media.

Your courier must have a name and media, at least one medium.

#### Notifications.collection
`Notifications.collection` is your notification Meteor Collection.

##### A given notification instance
```js
notification = {
  userId //the user associated with this notification
  event //the notification event type (explained later)
  read //if the notification has been read 
  createdAt //when the notification was created
  message() //outputs some string
  url //the associated url, if any, used by routeSeenByUser (explained later)
  metadata //anything you need, useful in combo with notification.message()
}
```

#### Client permissions 
 You can add a `Notifications.collection.deny` if you would like to be more restrictive on client updates
 
 The built in permissions are:
```js
Notifications.collection.allow({
  insert: function(userId, doc){
    // new notifications can only be created via a Meteor method
    return false;
  },
  update: function (userId, doc) {
    return userId == doc.userId
  },
  remove: function (userId, doc) {
    return userId == doc.userId
  }
});
```
