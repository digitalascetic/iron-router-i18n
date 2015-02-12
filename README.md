# Iron Router i18n 

Add i18n support for the popular [Iron Router](http://atmospherejs.com/package/iron-router) package.


## History

**Latest Version:** 0.5.0

See the [History.md](https://github.com/yoolab/iron-router-i18n/blob/master/History.md) file for changes (including breaking changes) across
versions.


## About

Iron Router i18n adds support for i18n routes to Iron Router package for Meteor.

### Features:

* i18n system agnostic. It can be easily integrated with any existing i18n package (or at least it aims to).
Currently used with [TAPi18n](http://atmospherejs.com/package/tap-i18n) on an internal project.
* Switch language when a route is called with a language code in it. E.g.: `http://example.com/it/test` 
will change the language to italian while `http://example.com/en/test` will change the language to english.
* Define multiple language routes with a single configuration, share or override single configuration parameters
of each route.
* Redirect/switch to a language-aware route when the language code is missing from the url. E.g. it can automatically 
switch from `http://example.com/test` to `http://example.com/en/test` if current language is english.
* Configurable: url language code extraction, language switching on missing code, url language code strategy
e.g. one can support different behaviour on missing lang code (e.g. not redirect but serve default language content)
or use different language aware url schema e.g. `http://example.com/test.it` instead of `http://example.com/it/test`.
* Many configuration options adapting to different cases.
* Reactive `pathFor`, `urlFor`, `linkTo` helpers that update reactively on router language change.
* Custom language alias path, possibility to use custom language alias path instead of default schemas
 (see https://github.com/EventedMind/iron-router/issues/656). E.g. `/quienes-somos` as a path for spanish `about`.
* Default strategy to retrieve/set the language (e.g. based on HTTP headers and/or session variable)
* Server side behaviour, e.g. use a 301 redirect to url with language code when calling a server route.



##  Installation

Iron Router i18n can be installed with the meteor package system:

``` sh
$ meteor add martino:iron-router-i18n
```

## Docs

### Basic configuration

Here below a very basic example configuring the Router for three languages (all iron-router-i18n configuration options are within the i18n option
namespace):

```javascript
Router.configure({

    ...

    i18n: {

        languages: ['it', 'es', 'en']

    }
});
```


### Basic usage

Iron Router i18n can be used out of the box with its default route i18n alias strategy which just prefix routes with 
language codes e.g. the `about` route with path `/about` will be `/en/about` for english  and `/es/about` for spanish.
 
Since version 0.3.0 is also possible to specify custom path for i18n on each route. I18n routes configurations can 
override other default route options in addition to `path`.
 
```javascript

     Router.route('about', {
         path: '/about',
         template: 'about',
         i18n: {
             languages: {
                 it: {
                     path: '/chi-siamo',
                     template: 'about_it',
                 }
             }
         }
 
     });

     
```

or, with new Iron Router 1.0.x

```javascript

     Router.route('/about', {

         template: 'about',

         i18n: {
             languages: {
                 it: {
                     path: '/chi-siamo',
                     template: 'about_it',
                 }
             }
         }

     });


```

or

```javascript

     Router.route('/about', function() {

        var lang = this.getLanguage();

        if (lang == 'it') {
            this.render('about_it');
        } else {
            this.render('about');
        }

     },

     {

         i18n: {
             languages: {
                 it: {
                     path: '/chi-siamo',
                 }
             }
         }

     });


```

Given the router configuration above both configurations will create 3 routes:

* `/en/about/` the "default language" route with template "about"
* `/it/chi-siamo/` the custom path route with template "about_it"
* `/es/about/` the es route with template "about"


### Configuration options

#### languages

Array that specify the supported languages, use it to identify url fragments that can be considered language codes (defaults to `['en']`)

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

#### defaultLanguage

Set the default language for Iron Router i18n (defaults to `'en'`).

#### autoConfLanguage

If set to true Iron Router i18n will try to autodetect the best language to use for current browser/request (defaults to false).

#### compulsoryLangCode

If set to true the router will consider compulsory for a route path to have a language code (e.g. `/en/about`) if the language code
is not found (through `getLangCode` function) `missingLangCodeAction` function will be called (default to true).

#### serverSide (just server)

Enable (true) or disable (false) server side functionality (default: false).

#### redirectCode (just server)

The redirect code to use when redirecting when the lang code is missing from path (default: 301)


#### getDefaultLanguage()

Provides a method to return the default "fallback" language for Iron Router i18n. This is the language "fallback" language
 used when no current language is defined with `Router.setLanguage` or by using `autoConfLanguage`.
(default implementation just returns defaultLanguage property which default to "en"). 

#### addLangCode(url)

If set will be used to add the language code to a route path which is missing one. Default implementation will add
 the language code as a prefix to the path. E.g. the route

```javascript
     Router.route('/about');
```
with the default implementation will generate three routes with path: `/en/about`, `/es/about`, `/it/about`.


#### getLangCode(path)

Given the path returns the language code (or null if no language code is found in the path).
Default implementation return the language prefix, e.g. for path `/de/about` will return "de".
By changing `getLangCode` and `setLangCode` can be used alternatives strategies to language prefixing.

E.g.

```javascript
Router.configure({

    ...

    i18n: {

        ...
        
        getLangCode: function(path) {
          ...
        }

    }
});
```

#### getLanguage(lang)

Called by `Router.getLanguage` to retrieve current language. Default implementation just use a local property.


#### setLanguage(lang)

Called when the Router language is changed programmatically (`Router.setLanguage(lang)`) or when changing the current 
language with a request containing a lang code e.g. `/es/about` will change the Router language and call this method.
The method can be used to propagate the action to a i18n system e.g.

```javascript
Router.configure({

    ...

    i18n: {

        ...
        
        setLanguage: function(lang) {
          TAPi18n.setLanguage(lang);
        }
        
        ...

    }
});
```

#### missingLangCodeAction(path)

Action to be taken when no language code can be found in path by `getLangCode` (default is trying to redirect to a language aware path
based on the current configured language). E.g. when receiving a request for `/about` and the current language is "en"
it will redirect (`Router.go` on the client, 301 Redirect on the server) to `/en/about`. If the function returns `true` the 
request dispatch will return immediately after this method execution, otherwise it will continue normally.


#### langCodeAction(path)

Action to be taken when a language code is found by `getLangCode`. Default is using `Router.setLanguage` to set the language.
E.g. when `/es/about` is called and the current language is not spanish, the current language will be switched to spanish.


#### setLangCode(lang)

Action to be taken when switching programmatically the language code in the URL (see "Methods" below). Default behaviour
is to change the url according to the default lang code "prefix" strategy. E.g. if calling `Router.setLanguage('it')`
while at path '/en/about' of the above example conf it will automatically switch the location to `/it/chi-siamo`.


#### getDefaultLanguage()

Returns the default language for the Router. Default implementation just return "en".


### Methods

#### Router.setLanguage(lang)

Programmatically changes the router language. This can be used to set the router language based on some user properties
(e.g. after login or on the startup script based on some cookie) or when a user switch the language with some action.


#### Router.getLanguage()

Retrieves the current language the router is using.

#### Router.getDefaultLanguage()

Gets the default language the router is using (see `defaultLanguage` property and `getDefaultLanguage` hook)

#### Router.getLanguageDep()

Returns language dependency, can be used to change reactively on router language change.


### Helpers

#### pathFor

Overrides iron:router pathFor helper making it reactive on router language change and adds the "lang" parameter 
to force language for path. 

E.g.

`{{pathFor route='items' lang="it"}}`

will always show route `'items'` for language `it`.

#### urlFor

The same as `pathFor` but returning absolute URL.

#### linkTo

The same as `pathFor` but returning a links.

## License

MIT
