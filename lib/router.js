I18NRouter = function (options) {

    var router = Iron.Router.call(this, options);
    return router;

}

I18NRouter.prototype = Iron.Router.prototype;

var superConfigure = I18NRouter.prototype.configure;

var superRoute = I18NRouter.prototype.route;

I18NRouter.prototype.configure = function (options) {

    superConfigure.call(this, options);

    var i18nDefaults = {

        origPath: null,

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

                var languages = options.i18n.languages;
                if (languages) {
                    if (!_.contains(languages, langCode)) {
                        langCode = null;
                    }
                } else {
                    console.log("Router config options i18n.languages is compulsory on " + getEnv() + ".");
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

    return this;

};

I18NRouter.prototype.route = function (path, fn, opts) {

    var route = superRoute.call(this, path, fn, opts);

    if (!this.options.i18n || (this.options.i18n && !this.options.i18n.languages)) {
        return route;
    }

    var routerLanguages = this.options.i18n.languages;
    var options = route.options;

    // The route has no i18n conf section, is valid for all configured languages as is
    if (!options.i18n) {
        route._i18n = {};
        route._i18n.langs = routerLanguages;
        return route;
    }

    var configuredLanguageRoutes = options.i18n.languages;
    // Whether the route should be limited to the languages explicitly configured in its i18n section (limitToSpecified == true)
    var routeLanguages = options.i18n.limitToSpecified ? _.keys(configuredLanguageRoutes) : routerLanguages;
    var defaultRouteLanguages = _.difference(routeLanguages, _.keys(configuredLanguageRoutes));

    route._i18n = {};
    route._i18n.routes = {};
    route._i18n.langs = defaultRouteLanguages;

    for (var lang in configuredLanguageRoutes) {
        var i18n_options = _.clone(options);
        _.extend(i18n_options, configuredLanguageRoutes[lang]);

        var newRoute = superRoute.apply(this, [route.getName() + '_' + lang, i18n_options]);
        newRoute._i18n = {};
        newRoute._i18n.langs = [lang];
        newRoute._i18n.defaultRoute = route;
        route._i18n.routes[lang] = newRoute;
    }


    return route;
}


function getEnv() {
    return Meteor.isClient ? 'client' : 'server';
};

I18NRouter.prototype.setLanguage = function (lang) {

    this._i18n.language = lang;

    if (this.options.i18n.setLanguage) {
        this.options.i18n.setLanguage(lang);
    }

    if (this._currentController && this.options.i18n.setLangCode) {
        this.options.i18n.setLangCode.apply(this, [lang, this.options]);
    }
    this._i18n.languageDep.changed();
};

I18NRouter.prototype.getLanguage = function () {

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

I18NRouter.prototype.getDefaultLanguage = function () {

    if (this.options.i18n.getDefaultLanguage) {
        return this.options.i18n.getDefaultLanguage.apply(this);
    }

    return 'en';

};

I18NRouter.prototype.getOrigPath = function () {
    return this._i18n.origPath;
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




