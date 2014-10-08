`Last updated: 2014-10-06`

## v0.8.1
  * full package refactor
  * removed deprecated metadata
  * removed alias Notifications
  * added artwells:queue as a core dependency

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
