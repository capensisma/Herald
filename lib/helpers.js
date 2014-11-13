//literally mark-All-As-Read, cheers :)
Meteor.methods({
  heraldMarkAllAsRead: function () {
    Herald.collection.update(
      {userId: this.userId},
      {
        $set: {
          read: true
        }
      },
      {multi: true}
    );
  }
});
