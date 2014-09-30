#### THIS README IS OUT OF DATE.... AGAIN!

#Universal Notifications

A notifications pattern straight out of Telescope! By itself it supports in app notifications but allows for extension packages that add anything from email to text messages.

##Current Status:
Feedback wanted! Help Appreciated. 
Nearly ready to be added to Telescope. 
When that happens I hope to see more movement on extention packages.

## Usage

#### On Client and Sever
You will want to set up a courier. Couriers do all the heavy lifting and manage dilivery of all the notifications. Without an extention package the Couriers insures the notification is delivered to the client browser. When you add extention pacakges they will also manage your other forms of media.

Your courier must have a name and media, at least one medium.

An example from Telescope
```js
Notifications.addCourier('newReply', {
  message: function () {
    return this.properties.comment.author + 
    " has replied to your comment on \"" + 
    this.properties.post.title + "\"";
  },
  media: {
    name: 'onsite', //Metoer app medium
    default: true //If the user has not notificaiton settings send by default (currently required)
  }
});

```

#### On the Server
You can create a new notification on the server with createNotification. 

This will likely be cleaned up but you most supply a userId, and event. Properties stores in collection metadata, may need to name that better.

An example also out of Telescope.
```js

params = {
    event: 'newReply',
    properties: {
      comment: //some comment data
      post: //some post data
      parentComment: //some parentComment data
    }
  };

Notifications.createNotification(userToNotifyId, params, function (error, notificationId) { 
    if (error) throw error; //output error like normal
    
    if(Meteor.isServer && getUserSetting('notifications.replies', false, userToNotify)){
      var notification = Notifications.collection.findOne(notificationId);
      // send email
    }
  })
```
#### On the Client

Currently I have not added any client code other then an auto subscribe if the user is logged in. I am not sure adding templates is even a good idea. I have seen too many packages that are practically unusable because the are locked into a single style. Like Meteor's core account-ui or anything that uses bootstrap only. 

For now just call `Notifications.collection.find()` on the client to get what you need.


##Current Features

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
