# Iron Router i18n 

Add i18n support for the popular [Iron Router](http://atmospherejs.com/package/iron-router) package.


## History

**Latest Version:** 0.3.1

See the [History.md](https://github.com/yoolab/iron-router-i18n/blob/master/History.md) file for changes (including breaking changes) across
versions.

## About

Iron Router i18n adds support for i18n routes to Iron Router package for Meteor.

### Features:

* i18n system agnostic. It can be easily integrated with any existing i18n package (or at least it aims to).
Currently used with [TAPi18n](http://atmospherejs.com/package/tap-i18n) on an internal project.
* Switch language when a route is called with a language code in it. E.g.: `http://example.com/it/test` 
will change the language to italian and map to ``http://example.com/test`` while `http://example.com/en/test` will 
change the language to english but still map to `http://example.com/test`. 
* Redirect/switch to a language-aware route when the language code is missing from the url. E.g. it can automatically 
switch from `http://example.com/test` to `http://example.com/en/test` if current language is english.
* Configurable: default strategies provide all above mentioned features: lang code extraction, language switching, 
redirect and path rewrite but each of these is overridable on Router configuration by a custom strategy so that 
e.g. one can support different behaviour on missing lang code (e.g. not redirect but directly serve default language) 
or use different language aware url schema e.g. `http://example.com/test.it` instead of `http://example.com/it/test`.
* Provides reactive `pathFor` `urlFor` helpers that change reactively on router language change.
* Provides custom language alias path (see https://github.com/EventedMind/iron-router/issues/656).



### TODO:

* Provide default strategy to retrieve/set the language (e.g. based on HTTP headers and/or session variable)
* Provide/review server side behaviour (most of the code is client and server but missing server HTTP part).


Iron Router i18n works with Iron Router 0.9.1 and above.


##  Installation

Iron Router i18n can be installed with the meteor package system:

``` sh
$ meteor add martino:iron-router-i18n
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

### Basic usage

Iron Router i18n can be used out of the box with its default route i18n alias strategy which just prefix routes with 
language codes e.g. the `about` route with path `/about` will be `/en/about` for english  and `/es/about` for spanish.
 
Since version 0.3.0 is also possible to specify custom path for i18n on each route. I18n routes configurations can 
override other default route options in addition to `path`.
 
```javascript

Router.map(function () {

     ...

     this.route('about', {
         path: '/about',
         template: 'about',
         i18n: {
             languages: {
                 it: {
                     path: '/chi-siamo',
                     template: 'about-it',
                 },
                 es: {
                     path: '/quienes-somos'
                 }
             }
         }
 
     });
     
     ...
     
```


### Configuration options

#### languages

**REQUIRED**: Array that specify the supported languages, use it to identify url fragments that can be considered language codes.

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

#### getDefaultLanguage()

Returns the default language for the Router. Default implementation just return "en".


### Methods

#### Router.setLanguage(lang)

Programmatically changes the router language.


#### Router.getLanguage()

Gets the current language the router is using for i18n.

#### Router.getDefaultLanguage()

Gets the default language the router is using for i18n.


### Helpers

#### pathFor
Overrides iron:router pathFor helper making it reactive on router language change and adds the "lang" parameter 
to force language for path. 

E.g.

`{{pathFor route='items' lang="it"}}`

will always show route `'items'` for language `it`.

#### urlFor

The same as `pathFor` for gives absolute URL.

## License

MIT
