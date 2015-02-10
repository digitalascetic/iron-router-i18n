var assert = Iron.utils.assert;

function getEnv() {
    return Meteor.isClient ? 'client' : 'server';
};


I18NRouter = function (options) {

    var router = Iron.Router.call(this, options);
    return router;

}

I18NRouter.prototype = Iron.Router.prototype;

var superConfigure = I18NRouter.prototype.configure;

var superRoute = I18NRouter.prototype.route;

var superDispatch = Iron.Router.prototype.dispatch;

I18NRouter.prototype.configure = function (options) {

    superConfigure.call(this, options);

    var i18nDefaults = {

        language: null,

        hooks: {

            defaultLanguage: 'en',

            serverSide: false,

            redirectCode: 301,

            autoConfLanguage: false,

            client: {},

            server: {},

            getLangCode: function (path, options) {

                var langCode;
                var langSepPos = path.substr(1).indexOf('/');

                if (langSepPos != -1) {
                    langCode = path.substr(1, langSepPos);
                } else {
                    langCode = path.substr(1);
                }

                if (!_.contains(options.i18n.languages, langCode)) {
                    langCode = null;
                }

                return langCode;
            },

            langCodeAction: function (path, options) {
                var langCode = options.i18n.getLangCode(path, options);
                var lang = this.getLanguage();
                if (lang) {
                    if (langCode != lang) {
                        this.setLanguage(langCode);
                    }
                } else {
                    console.log("Can't retrieve current language on " + getEnv() + ".")
                }
            },

            rewritePath: function (path, options) {

                var langSepPos;
                var langCode = options.i18n.getLangCode(path, options);

                if (langCode) {
                    langSepPos = path.substr(1).indexOf('/');
                    if (langSepPos != -1) {
                        return path.substr(langSepPos + 1);
                    } else {
                        return '/';
                    }
                }

                return path;

            },

            getDefaultLanguage: function () {
                return this.options.i18n.defaultLanguage;
            }

        }

    };

    // First time calling "configure", default configuration
    if (!this._i18n) {
        this._i18n = i18nDefaults;
        this._i18n.languageDep = new Deps.Dependency();
        this.options.i18n = {};
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

    if (!this.options.i18n.languages) {
        this.options.i18n.languages = ['en'];
    }

    return this;

};

I18NRouter.prototype.route = function (path, fn, opts) {

    var typeOf = function (val) {
        return Object.prototype.toString.call(val);
    };
    assert(typeOf(path) === '[object String]' || typeOf(path) === '[object RegExp]', "Router.route requires a path that is a string or regular expression.");

    var defaultAction;

    if (typeof fn === 'object') {
        opts = fn;
        fn = opts.action;
    }

    var defaultLanguage = this.getDefaultLanguage();
    var routerLanguages = this.options.i18n.languages;
    var defaultOptions = _.clone(opts);
    var configuredLanguageRoutes = {};
    var routeLanguages = routerLanguages;

    var route = superRoute.call(this, path, fn, opts);

    route._i18n = {};
    route._i18n.routes = {};
    route._i18n.langs = [defaultLanguage];

    if (opts && opts.i18n && opts.i18n.languages) {
        configuredLanguageRoutes = opts.i18n.languages;
        if (configuredLanguageRoutes[defaultLanguage]) {
            _.extend(opts, opts.i18n.languages[defaultLanguage]);
        }
        // Whether the route should be limited to the languages explicitly configured in its i18n section (limitToSpecified == true)
        routeLanguages = opts.i18n.limitToSpecified ? configuredLanguageRoutesCodes : _.difference(routerLanguages, [defaultLanguage]);
    }

    var configuredLanguageRoutesCodes = _.keys(configuredLanguageRoutes)
    var self = this;

    _.each(routeLanguages, function (lang) {

        var i18n_options = _.clone(defaultOptions);
        var newPath;

        if (i18n_options) {

            i18n_options.path = undefined;
            i18n_options.name = undefined;
            i18n_options.i18n = undefined;
            if (!i18n_options.action) {
                i18n_options.action = fn;
            }

            if (_.contains(configuredLanguageRoutesCodes, lang)) {
                _.extend(i18n_options, configuredLanguageRoutes[lang]);
            }

            newPath = i18n_options.path;
        }

        if (!newPath) {
            newPath = '/' + lang + route.handler.path
        }

        var newRoute = superRoute.call(self, newPath, i18n_options);
        newRoute._i18n = {};
        newRoute._i18n.langs = [lang];
        newRoute._i18n.defaultRoute = route;
        route._i18n.routes[lang] = newRoute;
    });


    return route;
}

I18NRouter.prototype.dispatch = function (url, context, done) {

    var langCode;

    if (this.options.i18n.getLangCode) {
        langCode = this.options.i18n.getLangCode.call(this, url, this.options);
    }

    if (!langCode) {

        if (_.isFunction(this.options.i18n.missingLangCodeAction)) {
            if (this.options.i18n.missingLangCodeAction.call(this, url, this.options)) {
                return;
            }
        }

    } else {

        if (this.options.i18n.langCodeAction) {
            this.options.i18n.langCodeAction.call(this, url, this.options);
        }

    }

    superDispatch.call(this, url, context, done);

};

I18NRouter.prototype.setLanguage = function (lang) {

    this._i18n.language = lang;

    if (this.options.i18n.setLanguage) {
        this.options.i18n.setLanguage(lang);
    }

    if (this._currentController && this.options.i18n.setLangCode) {
        this.options.i18n.setLangCode.call(this, lang, this.options);
    }
    this._i18n.languageDep.changed();
};

I18NRouter.prototype.getLanguage = function () {

    this._i18n.languageDep.depend();

    var lang = null;

    if (this.options.i18n.getLanguage) {
        lang = this.options.i18n.getLanguage();
    } else {
        lang = this._i18n.language;
    }

    if (!lang) {
        lang = this.getDefaultLanguage();
    }

    return lang;
};

I18NRouter.prototype.getLanguageDep = function () {

    return this._i18n.languageDep;

};

I18NRouter.prototype.getDefaultLanguage = function () {

    if (this.options.i18n.getDefaultLanguage) {
        return this.options.i18n.getDefaultLanguage.call(this);
    }

    return 'en';

};

// This should be no needed anymore, see https://github.com/yoolab/iron-router-i18n/issues/16
// as to why it was introduced (now initialization happens in router creation so before any package method call
/*
 Meteor.startup(function () {

 var routeCount = Router.routes.length;

 for (var n = 0; n < routeCount; n++) {

 var route = Router.routes[n];

 if (!route._i18n) {

 Router._i18n.configI18nRoute(route);

 }

 }

 });
 */




