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


