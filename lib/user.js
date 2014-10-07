//userPrefrence
Herald.userPrefrence = function (user, medium, courier) { return true }//noop


// sendToMedium = function (user, courier, medium) {
//   var mediumObject = Herald._courier[courier].media[medium]

//   //does this courier support this medium? (false positive)
//   if (!mediumObject) {
//     return false;
//   };
//   //is this medium blocked by admin?
//   if (Herald.settings.overrides[medium]) {
//     return false;
//   };
//   //does the user want notifications on this medium?
//   //check general preferences and courier preferences
//   if (checkUserPreferencesSet(user, courier, medium)) { //has any preferences
//     if (user.profile.notificationPreferences[medium]) { //has general preferences
//       if (user.profile.notificationPreferences[courier]) { //override general preference
//         if (user.profile.notificationPreferences[courier][medium]) {
//           return true;
//         };
//       } else {
//         return true;
//       };
//     } else if (user.profile.notificationPreferences.courier //courier only preference
//       && user.profile.notificationPreferences.courier[medium]) {
//       return true;
//     };
//   };
//   //if no user preference then use courier default
//   if (mediumObject.hasOwnProperty('default')) {
//     if (mediumObject.default) {
//       return true;
//     };
//   } else {
//     return true;
//   };
//   return false;
// };

//existence check
// checkUserPreferencesSet = function (user, courier, medium) {
//   return (user.profile && user.profile.notificationPreferences && 
//     (user.profile.notificationPreferences[courier] || user.profile.notificationPreferences[medium]));
// };


//literally mark-All-Herald-As-Read, cheers :)
// Meteor.methods({
//   markAllNotificationsAsRead: function() {
//     Herald.collection.update(
//       {userId: Meteor.userId()},
//       {
//         $set:{
//           read: true
//         }
//       },
//       {multi: true}
//     );
//   }
// });
