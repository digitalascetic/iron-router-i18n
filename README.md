# Iron Router i18n 

Add i18n support for the popular [Iron Router](http://atmospherejs.com/package/iron-router) [meteor](https://www.meteor.com/) package.


## History

**Latest Version:** 1.1.0

Docs for previous 0.5.x versions can be found [here](https://github.com/yoolab/iron-router-i18n/tree/0.5.x). Upgrade to 1.x versions can be done just by switching to [i18n-conf](https://atmospherejs.com/martino/i18n-conf) configuration.

See the [History.md](https://github.com/yoolab/iron-router-i18n/blob/master/History.md) file for changes (including breaking changes) across versions. 

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
* [i18n-conf](https://atmospherejs.com/martino/i18n-conf) based configuration and management.
* Many other configuration and tweaking options (see docs)



##  Installation

Iron Router i18n can be installed with the meteor package system:

``` sh
$ meteor add martino:iron-router-i18n
```

## Docs

### Basic configuration

Basic Iron Router i18n configuration is done through [i18n-conf](https://atmospherejs.com/martino/i18n-conf) 

```javascript
I18NConf.configure({

         defaultLanguage: 'en',

         languages: ['es', 'en'],

         autoConfLanguage: false

     });
```

Other specific options can be configured directly on the Router (all iron-router-i18n configuration options are within the i18n option namespace):

```javascript
Router.configure({

       i18n: {
       
         ...
         
         compulsoryLangCode: true,
         
         langCodeForDefaultLanguage: false,
       
         server: {
         
                   exclude: {
                      sitemap: '^\/sitemap\.xml'
                   }
         
                 }
         }
         
         ...
         
         
     });
```

Router language will be automatically changed using ```I18NConf.setLanguage(lang)``` and I18NConf current language will be changed when calling a language aware route (e.g. ```/es/about``` will change the language to ```es```.


### Basic usage

Iron Router i18n can be used out of the box with its default route i18n alias strategy which just prefix routes with  language codes e.g. the `about` route with path `/about` will be `/en/about` for english  and `/es/about` for spanish.
 
Since version 0.3.0 is also possible to specify custom path for i18n on each route. I18n routes configurations can override other default route options in addition to `path`.
 
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

or, with new Iron Router 1.x

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

#### compulsoryLangCode

If set to true the router will consider compulsory for a route path to have a language code (e.g. `/en/about`) if the language code is not found (through `getLangCode` function) `missingLangCodeAction` function will be called (default to true). You can set ```langCodeForDefaultLanguage``` if you just want to disable lang code for default language url.

#### serverSide (just server)

Enable (true) or disable (false) server side functionality (default: false).

#### redirectCode (just server)

The redirect code to use when redirecting when the lang code is missing from path (default: 301)

#### addLangCode(url)

If set will be used to add the language code to a route path which is missing one. Default implementation will add
 the language code as a prefix to the path. E.g. the route

```javascript
     Router.route('/about');
```
with default implementation will generate three routes with path: `/en/about`, `/es/about`, `/it/about`.


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

#### missingLangCodeAction(path)

Action taken when ```compulsoryLangCode``` is set to ```true``` and no language code can be found in path by `getLangCode` (default is trying to redirect to a language aware path based on the current configured language). E.g. when receiving a request for `/about` and the current language is "en" it will redirect (`Router.go` on the client, 301 Redirect on the server) to `/en/about`. If the function returns `true` the request dispatch will return immediately after this method execution, otherwise it will continue normally.


#### langCodeAction(path)

Action to be taken when a language code is found by `getLangCode`. Default is using `Router.setLanguage` to set the language.
E.g. when `/es/about` is called and the current language is not spanish, the current language will be switched to spanish.


#### setLangCode(lang)

Action to be taken when switching programmatically the language code in the URL (see "Methods" below). Default behaviour is to change the url according to the default lang code "prefix" strategy. E.g. if calling `Router.setLanguage('it')` while at path '/en/about' of the above example conf it will automatically switch the location to `/it/chi-siamo`.


#### exclude

Gives the possibility to exclude specific routes or path patterns from being handled by Iron Router i18n, can be useful for special cases like admin pages or server side sitemap routes.

The exclude parameter can be configured as a string (will be interpreted as a Regex), a function (will be passed the path to match and will exclude the path by returning true), an array whose values are strings or functions (or other array of string and functions) or an object whose values are objects, array, strings or functions as described above.

The other possibility is to exclude a specific route just by setting to true the "exclude" parameter on the route.

```javascript
Router.configure({

    ...

    i18n: {

        ...

        exclude: {
          // Paths beginning with "/admin"
          admin_paths: '^\/admin',
          // Paths ending with ".special"
          special_paths: function(path) {
             if (path.substr(-8) == '.special' {
               return true;
             }
             return false;
          }

        },

        server: {

          exclude: {
             sitemap: '^\/sitemap\.xml'
          }

        }

        ...

    }
});
```

To exclude a single route:

```javascript

     Router.route('about', {
         path: '/about',
         i18n: {
             exclude: true
         }

     });
```

#### langCodeForDefaultLanguage

Configure whether the language code should be added and considered for default language routes that is if deafault language is 'en' and set to ```false``` the three routes will be ```/about```, ```/es/about``` and ```/it/about``` instead of ```/en/about```, ```/es/about``` and ```/it/about```. Defaults to ```true```.


#### deferRouteCreation

Configure whether routes should be instantly created or their creation should be deferred to ```Meteor.startup``` phase. Default (```true```) is to 
defer route creation to ```Meteor.startup``` phase in order to avoid problems created by Meteor load order logic: if a file with ```Router``` (or ```I18NConf```)
 configuration is accidentally placed so that is loaded after some route creation (```Router.route```) this can cause unexpected behaviour,
  be aware about this if you decide to set ```deferRouteCreation``` to false.
 See [#63](https://github.com/yoolab/iron-router-i18n/issues/63) for details about it.



### Methods (Router)


#### Router.getLangCode()

Returns the current route language code (if any), e.g. "en" for "en/about". It can also be used to know whether the route was called with a lang code in it or not to know whether to switch language.

#### Router.isLangCodeMissing()

Used to know whether lang code was missing or not from original requested path (before eventual ```missingLangCodeAction``` redirection), see #38 for original motivation.


### Helpers

#### pathFor

Overrides iron:router pathFor helper making it reactive on router language change. Adds the "lang" parameter to force language for path and the "origRoute" parameter to show the original non localized route path. 

E.g.

```
 Router.route('about');
```


```{{pathFor route='items' lang="it"}}```

will show path ```/it/about```

```{{pathFor route='items' origRoute="true"}}```

will show path ```/about```, the "original", non localized path, (see [#55](https://github.com/yoolab/iron-router-i18n/issues/55) for a use case for this)



#### urlFor

The same as `pathFor` but returning absolute URL.

#### linkTo

The same as `pathFor` but returning a links.

## License

MIT
