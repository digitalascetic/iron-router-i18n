## v0.5.8

* **NEW FEATURE** added ```origRoute``` support on helpers and ```path``` method, shows a non localized path version of the route (see #55)
* **NEW FEATURE** change html ```lang``` attribute on language change (see #56)
* Fixed bug on ```setLangCode``` with non existent route (see #54)

## v0.5.7

* Fixed bug causing in certain cases to set persist language cookie on different paths than root ("/") (see #53)
* ```Router.getLanguage``` was not using i18n-conf when available (bug, see #51)
* Language was autoconfigured even when previously persisted (bug, see #52)
* Fixed bugs regarding i18n-conf weak dependency 

## v0.5.6

* Fix bug causing ```setLanguage``` being called twice when using i18n-conf (see #50)

## v0.5.5

* **NEW FEATURE** Added [martino:i18n-conf](https://atmospherejs.com/martino/i18n-conf) based configuration (see [#46](https://github.com/yoolab/iron-router-i18n/issues/46)).


## v0.5.4

* **NEW FEATURE** Added ```langCodeForDefaultLanguage``` configuration options to allow language code to be removed from default language routes.
* **NEW FEATURE** Added ```persistLanguage``` configuration options, default implementation persist the chosen language between requests through a cookie (#37)
* Fixed a bug with ```autoConfLanguage``` not working with browser presenting country code specific languages (see #42).
* Handled the strange way Chrome manage ```navigator.language``` preventing ```autoConfLanguage``` to work correctly (#44).
* Fixed and edge case that prevented back button to work (#43).


## v0.5.3

* Added the possibility to exclude specific paths from i18n #39
* Added ```Router.isLangCodeMissing``` to know whether lang code was missing or not from original requested path (before
eventual ```missingLangCodeAction``` redirection), see #38.


## v0.5.2

Bug fixing and better compatibility with other Iron Router modules. Thanks to @dohomi and @mxab
for continuous feedback.

* Added ```Route.getI18nName``` method to retrieve internal i18n name for route (```getName``` always return the name
of the default route).
* Added ```Router.isLanguageSet``` method. Returns true if the language was explicitly set (i.e. if ```setLanguage```
method was called at least once). Can be useful to know whether ```getLanguage``` is just returning the default language
or a language explicitly set.
* Added ```Router.getLangCode``` method to retrieve the current route language code (if any). It can also be used to know
whether the route was called with a lang code to know whether to switch language (thanks @dohomi).
* Improved Iron Router override method by overriding Router global object methods and Iron.Router prototype methods (#32)
this should allow easy testing and better compatibility with other Iron Router modules.
* Overridden ```Route.path``` to be language aware (so to also have language aware ```Router.path``` and ```Router.url```)
* Fixed linkTo helper not working for missing DynamicTemplate in namespace (thanks @andreivolt)
* Fixed #33 provide more coherent iron router i18n functionality with respect to behaviours using route name
* Fixed #27 (but see also #32 for a more general approach )


## v0.5.1

* Fixed #29 (previous version was mistakenly deployed and published without needed dependency and code).


## v0.5.0

* **BREAKING CHANGE** Iron Router 1.0.x compatibility (#19). Default configuration tries to retain as much as
possible 0.4.x behaviour and configuration methods. It supports all new Iron Router features and configuration
methods.
* **BREAKING CHANGE** Removed `rewritePath` (use `addLangCode` instead).
* Introduced `compulsoryLangCode` configuration parameter if set to true makes language
code compulsory on urls, if any language code is missing from the url  `missingLangCodeAction` function will be called.
Default value is `true`.
* Introduced `addLangCode` configuration parameter: if defined this function is used to
add the language code to the passed url. Default implementation add prefix lang code e.g. `/test` -> `/es/test`
* Added `Router.getLanguageDep()` to change reactively on router language change.
* Added `linkTo` helper.
* Added many tests and improved test system.
* Added a sample application to test basic functionality in `examples` folder.


## v0.4.3

* Fixed bug that caused incorrect history when hardcoding path without "lang" in `a`. Modified `missingLangActionCode`
 behaviour: if it returns `true` request dispatch will return immediately, otherwise it will go ahead. (#18)
* Fixed bug on server side use of locale package (#17)


## v0.4.2

* Made routes added in packages behave the same as routes added in the main app. (#16)

## v0.4.1

* Fixed a bug in missing lang code redirect.

## v0.4.0

* Added server side behaviours (redirect to lang code URL when lang code is missing)
* Added automatic initial language configuration for client and server
* Reintroduced `getLanguage` hook (gives the possibility to have a different language strategy on server side (e.g. user session based)
* Refactored test system and added server and client side tests

## v0.3.3

* **BREAKING CHANGE**: #11 `getLanguage` hook is not used anymore, `setLanguage` hook is now optional (see docs).
* Fixed bug caused by `pathFor` returning paths without the initial slash (#10) 

## v0.3.2

* Fixed several problems with default language configuration (see #11 and #13).
* Fixed some server side problems with some code that wasn't intended to run on the server 
(still waiting to review the server part of the package)

## v0.3.1

* Fix problem with `pathFor` and `urlFor` helpers (#10).

## v0.3.0

* Moved i18n configuration process on overridden Router.configure method (just happen once on Router initialization).  
* Added tests and improved test system
* Added the possibility to configure custom i18n paths for routes. 
* Fixed #8, specify on warning and error messages whether it's a client or server issue.
* Fixed #7, double "/" on overridden Router.path.

## v0.2.4

* Fixed bug #6, Router.go hash options not working.

## v0.2.3

* **BREAKING CHANGE**: `i18n.languages` option is now compulsory
* Fixed bug: `urlFor` was not working when using parametrized paths (again)
* Fixed bug: url rewriting wa not working properly for routes expressed as path in some cases.

## v0.2.2

* Fixed bug: `pathFor` and `urlFor` were not working when using parametrized paths.


## v0.2.1

* Fixed bug: `pathFor` and `urlFor` not working when language was not set
* Fixed bug: using Router.go with named routes did not work.
* Fixed bug: changing language after a Router.go setting wrong location on browser

## v0.2.0

* Overridden reactive language dependent versions of iron:router `pathFor` and `urlFor` helpers.
* Basic tests for router dispatch i18n 
* Added `Router.getLanguage`/`Router.setLanguage` methods.
* Removed `Router.setLangCode` method.

## v0.1.2

* Added versions.json for repeatable package builds

## v0.1.1

* Updated package to new Meteor 0.9 package system

## v0.1.0

* Initial release


