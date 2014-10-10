# Herald ChangeLog - up-to-date as possible.

## v1.0.0-pre2
  * massive readme improvements
  * query not querry typo fixes
  * userPrefrenceDefault not userPrefrenceDefualt typo fixes
  * TODO be sure generic user medium preferences are respected.

## v1.0.0-pre1
  * added getNotifications as a convenience function
  * added heraldMarkAllAsRead as a convenience method
  * added setUserMediaPreference for general media user preferences
  * added setUserCourierPreference for general courier-media user preferences
  * added getUserPrefrence for fetching specific user preferences
  * none of the above has been tested as of this pre-version

## v0.10.0
  * onRun added to couriers
  * fallback setting added to couriers - disables autorun but allowas for onRun.transfer
  * lots of backend changes.

## v0.9.0
  * full package refactor
  * removed deprecated metadata
  * removed alias Notifications
  * added artwells:queue as a core dependency
  * improved client and server escalation
  * onsite is now a true runner

## v0.8.0
  * Runners now require the where property, string or array
  * Autorun client-side runners where notifications are unread
  * This version is not backwards compatible without database migrations. If you have used an older version in production please make an issue and we can figure out the best course of action. ~sorry

## v0.7.2
  * Fixed bug caused by Herald.userPrefrence where no notifications would be sent.

## v0.7.1 
  * moved runnder definitions to lib for client side runners.

## v0.7.0
  * BREAKING CHANGE! - addRunner has a new api
  * Herald.userPrefrence is a noop for dev overloads

## v0.6.0
  * added transform and deprecated metadata

## v0.5.3
  * bug fix regarding iron:router.Router and load order 
  * Improved error outputs

## v0.5.2
  * moved iron:router code to client only

## v0.5.1
  * weak dependency fixes

## v0.5.0
 * Namespace change: Notifications -> Herald
   * Notifications aliased to Herald

## v0.4.0
 * init - first time on atmosphere
 * bad typo, named Herald "Harold" with find/replace all
 * "Harold" is on atmo but is marked as a reverted mrt-migration (until I can deprecate the mess)
