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


