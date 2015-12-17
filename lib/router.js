// First thing to do is to prevent Iron.Router autostart as we are creating our own
// router in globals and need to prevent Router created in Iron.Router global.js to autoStart
//on Meteor startup.
//Router.options.autoStart = false;

var assert = Iron.utils.assert;
var MiddlewareStack = Iron.MiddlewareStack;                                                   // 6


var Url = Iron.Url;

function getEnv() {
    return Meteor.isClient ? 'client' : 'server';
}

var superConfigure = Router.configure;

var superRoute = Router.route;

var superDispatch = Router.dispatch;

configurei18n = function (options) {

    var self = this;

    var i18nDefaults = {

        version: "1.2.2",

        language: null,

        isLangCodeMissing: false,

        pathExclusionFunctions: [],

        hooks: {

            serverSide: false,

            redirectCode: 301,

            compulsoryLangCode: true,

            langCodeForDefaultLanguage: true,

            client: {},

            server: {},

            getLangCode: function (url) {

                var path = Url.normalize(url);

                var langCode;
                var langSepPos = path.substr(1).indexOf('/');

                if (langSepPos != -1) {
                    langCode = path.substr(1, langSepPos);
                } else {
                    langCode = path.substr(1);
                }

                if (!_.contains(I18NConf.options.languages, langCode)) {
                    langCode = null;
                }

                return langCode;
            },

            addLangCode: function (url, lang) {

                return '/' + lang + (url !== '/' ? url : '');

            },

            langCodeAction: function (langCode) {

                var lang = I18NConf.getLanguage();
                if (lang != langCode) {
                    I18NConf.setLanguage(langCode);
                }
            }

        }

    };

    // First time calling "configure", default configuration
    if (!this._i18n) {
        this._i18n = i18nDefaults;
        this._i18n.languageDep = new Deps.Dependency();
        this.options.i18n = this.options.i18n || {};
        this._i18n.firstConfigure = true;
        this._i18n.savedRoutes = [];
    }

    var overriddenHooks = {};

    if (Meteor.isServer) {
        _.extend(this._i18n.hooks.server, this.options.i18n.server);
        overriddenHooks = this._i18n.hooks.server;
    } else {
        _.extend(this._i18n.hooks.client, this.options.i18n.client);
        overriddenHooks = this._i18n.hooks.client;

    }

    _.extend(this._i18n.hooks, this.options.i18n);
    _.extend(this.options.i18n, this._i18n.hooks);
    _.extend(this.options.i18n, overriddenHooks);

    var excludeOpt = this.options.i18n.exclude;

    /**
     * i18n.exclude can be:
     * 1) a string (will be interpreted as a Regex and tested against path)
     * 2) a function (will be passed the path in .test)
     * 3) an array of strings and functions (also a nested array)
     * 4) an object whose properties values are one of 1-4
     */
    var that = this;

    this._i18n.isPathExcluded = function (path) {
        var result = _.find(that._i18n.pathExclusionFunctions, function (excludeFunc) {
            return excludeFunc.call(that, path);
        });
        return !_.isUndefined(result);
    };

    if (excludeOpt) {

        var configureExclude = function (exclude) {

            if (_.isArray(exclude)) {
                _.each(exclude, function (elem) {
                        configureExclude.call(that, elem);
                    }
                )
            } else if (_.isFunction(exclude)) {
                that._i18n.pathExclusionFunctions.push(exclude);
            } else if (_.isString(exclude)) {
                var reg = new RegExp(exclude);
                that._i18n.pathExclusionFunctions.push(function (path) {
                    return reg.test(path);
                });
            } else if (_.isObject(exclude)) {
                for (var property in exclude) {
                    configureExclude(exclude[property]);
                }
            } else {
                console.log("'i18n.exclude' options must be a function, a string an array or an object.")
            }

        };

        configureExclude(excludeOpt);

    }

    if (this._i18n.firstConfigure) {

        /**
         * i18n-conf integration
         */
        I18NConf.onLanguageChange(function (oldLang, newLang) {

            if (_.isFunction(self.options.i18n.setLangCode) && self.current() && self.current().route) {
                self.options.i18n.setLangCode.call(self, newLang);
            }

            self._i18n.languageDep.changed();

        });

        I18NConf.onConfigure(function (options) {
            // Recreate all routes in case languages or defaultLanguage
            // configuration changes
            if (self.routes.length > 0 && (options.languages || options.defaultLanguage)) {
                self._recreateRoutes();
            }

        });

    }

    this._i18n.firstConfigure = false;

    return this;

};

Router.configure = function (options) {

    var recreateRoutes = false;

    if (options.i18n) {
        recreateRoutes = true;
    }

    superConfigure.call(this, options);

    var router = configurei18n.call(this, options);

    if (this.routes.length > 0 && recreateRoutes) {
        router._recreateRoutes();
    }

    return router;

};

Router._recreateRoutes = function () {
    // Reset routes
    this._stack = new MiddlewareStack;
    this.routes = [];
    this.routes._byPath = {};

    // Recreate routes from saved routes
    var savedRouteCount = this._i18n.savedRoutes.length;
    for (var n = 0; n < savedRouteCount; n++) {
        var defRoute = this._i18n.savedRoutes[n];
        var opts = defRoute.opts || {};
        opts.recreateRoute = true;
        this.route(_.clone(defRoute.path), _.clone(defRoute.fn), _.clone(opts));
    }
};

Router.route = function (path, fn, opts) {

    opts = opts || {};

    if (!opts.recreateRoute) {
        this._i18n.savedRoutes.push({path: _.clone(path), fn: _.clone(fn), opts: _.clone(opts)});
    }

    var typeOf = function (val) {
        return Object.prototype.toString.call(val);
    };
    assert(typeOf(path) === '[object String]' || typeOf(path) === '[object RegExp]', "Router.route requires a path that is a string or regular expression.");

    var origFn = fn;

    if (typeof fn === 'object') {
        opts = fn;
        fn = opts.action;
    }

    var defaultLanguage = I18NConf.getDefaultLanguage();
    var routerLanguages = I18NConf.options.languages;
    var defaultOptions = _.clone(opts);
    var configuredLanguageRoutes = {};
    var routeLanguages = routerLanguages;

    var pathIsName = false;
    var origPath = opts && opts.path ? opts.path : path;
    var defaultPath = origPath;
    var route;

    if (typeof path === 'string' && path.charAt(0) !== '/') {
        pathIsName = true;
        origPath = opts && opts.path ? opts.path : '/' + path;
    }

    var excluded = false;

    if (opts && opts.i18n && opts.i18n.exclude) {
        excluded = true;
        this._i18n.pathExclusionFunctions.push(function (path) {
            return path == origPath;
        })
    } else {
        if (this.options.i18n.exclude) {
            excluded = this._i18n.isPathExcluded(defaultPath);
        }
    }

    var origRoute;

    if (this.options.i18n.langCodeForDefaultLanguage && !excluded) {

        var origOpts = _.clone(opts) || {};

        if (pathIsName) {
            origOpts.path = origPath;
            origRoute = superRoute.call(this, path + ":origRoute", fn, origOpts);
        } else {
            origOpts.name = origPath.substr(1) + ":origRoute";
            origRoute = superRoute.call(this, origPath, fn, origOpts);
        }

    }

    if (!excluded
        && this.options.i18n.langCodeForDefaultLanguage
        && this.options.i18n.addLangCode) {
        defaultPath = this.options.i18n.addLangCode.call(this, origPath, defaultLanguage);
        if (this.options.i18n.getLangCode.call(this, origPath)) {
            console.log("Warning: route with path [" + origPath + "] already contains lang code, added route with path: [" + defaultPath + "]");
        }
        if (opts && opts.path) {
            opts.path = this.options.i18n.addLangCode.call(this, opts.path, defaultLanguage);
        }
    }

    if (pathIsName) {
        opts = opts || {};
        opts.path = defaultPath;
        route = superRoute.call(this, path, fn, opts);
    } else {
        route = superRoute.call(this, defaultPath, fn, opts);
    }

    if (excluded) {
        route._i18n = {};
        route._i18n.excluded = true;
        // Some methods always expect to find defaultRoute
        route._i18n.defaultRoute = route;
        return route;
    }

    route._i18n = {};
    route._i18n.routes = {};
    route._i18n.excluded = false;
    route._i18n.routes[defaultLanguage] = route;
    route._i18n.defaultRoute = route;
    route._i18n.origRoute = this.options.i18n.langCodeForDefaultLanguage ? origRoute : route;
    route.language = defaultLanguage;

    if (opts && opts.i18n && opts.i18n.languages) {
        configuredLanguageRoutes = opts.i18n.languages;
        if (configuredLanguageRoutes[defaultLanguage]) {
            _.extend(opts, opts.i18n.languages[defaultLanguage]);
        }
        // Whether the route should be limited to the languages explicitly configured in its i18n section (limitToConfigured == true)
        routeLanguages = opts.i18n.limitToConfigured ? _.keys(configuredLanguageRoutes) : _.difference(routerLanguages, [defaultLanguage]);
    } else {
        routeLanguages = _.difference(routerLanguages, [defaultLanguage]);
    }

    var configuredLanguageRouteCodes = _.keys(configuredLanguageRoutes);

    var self = this;

    _.each(routeLanguages, function (lang) {

        var i18n_options = _.clone(defaultOptions);
        var newPath;
        var newAction = origFn;

        if (i18n_options) {

            delete(i18n_options.path);
            delete(i18n_options.name);
            delete(i18n_options.i18n);

            if (_.contains(configuredLanguageRouteCodes, lang)) {
                _.extend(i18n_options, configuredLanguageRoutes[lang]);
            }

            newPath = i18n_options.path;
            if (i18n_options.action) {
                newAction = i18n_options.action;
                delete(i18n_options.action);
            }

        }

        if (!newPath) {
            newPath = '/' + lang + (origPath !== '/' ? origPath : '');
        }

        if (self.options.i18n.addLangCode && !self.options.i18n.getLangCode.call(self, newPath)) {
            newPath = self.options.i18n.addLangCode.call(self, newPath, lang);
        }

        if (i18n_options && i18n_options.path) {
            i18n_options.path = newPath;
        }

        var newRoute;
        if (newAction && typeof newAction === 'function') {
            newRoute = superRoute.call(self, newPath, newAction, i18n_options);
        } else {
            newRoute = superRoute.call(self, newPath, i18n_options);

        }

        newRoute._i18n = {};
        newRoute.language = lang;
        newRoute._i18n.defaultRoute = route;
        route._i18n.routes[lang] = newRoute;

    });

    return route;
};

Router.dispatch = function (url, context, done) {

    // Strangely enough Iron Router doesn't seem to have a place to store corrent url for client and server
    this._i18n.currentUrl = url;

    if (this._i18n.isPathExcluded(url)) {
        return superDispatch.call(this, url, context, done);
    }

    var langCode;

    if (this.options.i18n.getLangCode) {
        langCode = this.options.i18n.getLangCode.call(this, url);
    }

    if (!langCode && this.options.i18n.langCodeForDefaultLanguage) {

        this._i18n.isLangCodeMissing = true;

        if (this.options.i18n.compulsoryLangCode) {

            if (_.isFunction(this.options.i18n.missingLangCodeAction)) {
                if (this.options.i18n.missingLangCodeAction.call(this, url)) {
                    return;
                }

            }

        }

    }

    if (_.isFunction(this.options.i18n.langCodeAction)) {
        var route = this.findFirstRoute(url);
        if (route && route.language) {
            this.options.i18n.langCodeAction.call(this, route.language);
        }
    }

    return superDispatch.call(this, url, context, done);

};

Router.getLangCode = function () {

    var langCode = null;
    var url = null;

    // Use currentUrl if it was already set by dispatch (client and server)
    if (this._i18n && this._i18n.currentUrl) {
        url = this._i18n.currentUrl;
    } else {
        // Otherwise if currentUrl is not available client has another option to get it from browser location
        if (window) {
            url = window.location.href;
        }
    }

    if (this.options.i18n.getLangCode && url) {
        langCode = this.options.i18n.getLangCode.call(this, url);
    }

    return langCode;

};

Router.isLangCodeMissing = function () {
    return this._i18n.isLangCodeMissing;
};

Iron.Router.prototype.configure = Router.configure;
Iron.Router.prototype.route = Router.route;
Iron.Router.prototype._recreateRoutes = Router._recreateRoutes;
Iron.Router.prototype.dispatch = Router.dispatch;
Iron.Router.prototype.getLangCode = Router.getLangCode;
