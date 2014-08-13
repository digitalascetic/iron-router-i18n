# Iron Router i18n 

Add i18n support for the popular [Iron Router](http://atmospherejs.com/package/iron-router) package.


## History

**Latest Version:** 0.1.0

See the [History.md](https://github.com/yoolab/iron-router-i18n/blob/master/History.md) file for changes (including breaking changes) across
versions.

## About

Iron Router i18n adds support for i18n routes to Iron Router package for Meteor.

### Features:

* i18n system agnostic. It can be easily integrated with any existing i18n package (or at least it aims to).
Currently used with [TAPi18n](http://atmospherejs.com/package/tap-i18n) on an internal project.
* Switch language when a route is called with a language code in it. E.g.: `http://example.com/it/test` 
will change the language to italian and map to ``http://example.com/test`` while `http://example.com/en/test` will 
change the language to english but still map to `http://example.com:3000/test`. 
* Redirect/switch to a language-aware route when the language code is missing from the url. E.g. it can automatically 
switch from `http://example.com/test` to `http://example.com/en/test` if current language is english.
* Configurable: default strategies provide all above mentioned features: lang code extraction, language switching, 
redirect and path rewrite but each of these is overridable on Router configuration by a custom strategy so that 
e.g. one can support different behaviour on missing lang code (e.g. not redirect but directly serve default language) 
or use different language aware url schema e.g. `http://example.com/test.it` instead of `http://example.com/it/test`.

### TODO:

* Provide default strategy to retrieve/set the language (e.g. based on HTTP headers and/or session variable)
* Provide/review server side behaviour (most of the code is client and server but missing server HTTP part).
* Provide reactive `pathFor` helper changing url resolution on language change.
* Improve reactivity (e.g. make url change automatically on language change etc.)
* Provide custom language alias path (see https://github.com/EventedMind/iron-router/issues/656).


Iron Router i18n works with Iron Router 0.7.0 and above.


##  Installation

Iron Router i18n can be installed with [Meteorite](https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

``` sh
$ mrt add iron-router-i18n
```

## Docs

### Basic configuration

Basic configuration for the moment requires that at least `getLanguage`/`setLanguage` methods be defined on
Router i18n configuration options. This two methods are thought as the "bridge" between the i18n system (not provided
by iron-router-i18n) and iron-router-i18n itself.

Here below a very basic example using TAPi18n (all iron-router-i18n configuration options are within the i18n option
namespace):

```javascript
Router.configure({

    ...

    i18n: {

        getLanguage: function () {
            if (Meteor.isClient) {
                return TAPi18n.getLanguage();
            } else {
                return 'en';
            }
        },

        setLanguage: function (lang) {
            if (Meteor.isClient) {
                TAPi18n.setLanguage(lang);
            }
        }

    }
});
```

### Configuration options

#### languages

Array that can specify the supported languages, use it to identify url fragments that can be considered language codes.

E.g.

```javascript
Router.configure({

    ...

    i18n: {

        ...
        
        languages: ['en', 'es', 'it']

    }
});
```

#### getLangCode(path, options)

Given the path returns the language code (or null if no language code is found in the path).

E.g.

```javascript
Router.configure({

    ...

    i18n: {

        ...
        
        getLangCode: function(path, options) {
          ...
        }

    }
});
```

#### missingLangCodeAction(path, options)

Action to be taken when no language code can be found in path (default is trying to redirect to a language aware path
based on the current configured language).


#### langCodeAction(path, options)

Action to be taken when a language code is found. Default is using ``options.i18n.setLanguage`` to set the language.


#### rewritePath(path, options)

Called after ``langCodeAction`` it gives the option to rewrite the path before dispatching it through Iron Router.
Default strategy is to strip language code so that the path can match language agnostic routes.


#### setLangCode(lang)

Action to be taken when switching programmatically the language code in the URL (see "Methods" below). Default behaviour
is to change the url according to the default lang code "prefix" strategy and set the language accordingly through 
``options.i18n.setLanguage``
method.


### Methods

#### Router.setLangCode(lang)

Programmatically switches the url to a different language code one. This can be used e.g. with a language selector
when switching from a language to another one switching the url accordingly.


## License

MIT
