(function () {

    var superDispatch = Router.dispatch;

    var superRoute = Router.route;

    var superPath = Router.path;

    var superUrl = Router.url;

    var superOnRouteNotFound = Router.onRouteNotFound;

    var superConfigure = Router.configure;

    _.extend(Router, {

        getEnv: function () {
            return Meteor.isClient ? 'client' : 'server';
        },

        _i18n: {

            origPath: null,

            language: null,

            hooks: {

                defaultLanguage: 'en',

                serverSide: false,

                redirectCode: 301,

                autoConfLanguage: false,

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
                        console.log("Router config options i18n.languages is compulsory on " + this.getEnv() + ".");
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
                        console.log("Can't retrieve current language on " + this.getEnv() + ".")
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

            },

            configI18nRoute: function (route) {

                if (!Router.options.i18n || !Router.options.i18n.languages) {
                    return route;
                }

                var routerLanguages = Router.options.i18n.languages;
                var options = route.options;

                if (!options.i18n) {
                    route._i18n = {};
                    route._i18n.langs = routerLanguages;
                    return route;
                }

                var configuredLanguageRoutes = options.i18n.languages;
                var routeLanguages = options.i18n.limitToSpecified ? _.keys(configuredLanguageRoutes) : routerLanguages;
                var defaultRouteLanguages = _.difference(routeLanguages, _.keys(configuredLanguageRoutes));

                route._i18n = {};
                route._i18n.routes = {};
                route._i18n.langs = defaultRouteLanguages;

                for (var lang in configuredLanguageRoutes) {
                    var i18n_options = _.clone(options);
                    _.extend(i18n_options, configuredLanguageRoutes[lang]);

                    // Retain default template name for i18n routes
                    if (!i18n_options.template) {
                        i18n_options.template = route.name;
                    }

                    var newRoute = superRoute.apply(Router, [route.name + '_' + lang, i18n_options]);
                    newRoute._i18n = {};
                    newRoute._i18n.langs = [ lang ];
                    newRoute._i18n.defaultRoute = route;
                    route._i18n.routes[lang] = newRoute;
                }


                return route;
            }
        },

        setLanguage: function (lang) {

            this._i18n.language = lang;

            if (this.options.i18n.setLanguage) {
                this.options.i18n.setLanguage(lang);
            }

            if (this._currentController && this.options.i18n.setLangCode) {
                this.options.i18n.setLangCode.apply(this, [lang, this.options]);
            }
            this._i18n.languageDep.changed();
        },

        getLanguage: function () {

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
        },

        getDefaultLanguage: function () {

            if (this.options.i18n.getDefaultLanguage) {
                return this.options.i18n.getDefaultLanguage.apply(this);
            }

            return 'en';

        },

        route: function (name, options) {

            var route = superRoute.apply(this, [name, options]);
            return this._i18n.configI18nRoute(route);

        },

        match: function (path) {
            return _.find(this.routes, function (r) {
                if (r.test(path)) {
                    return r.matchLang(r.router.getLanguage());
                }
            });
        },

        url: function (routeName, params, options) {

            var lang;

            if (params && params.lang) {
                lang = params.lang;
            } else {
                lang = this.getLanguage()
            }

            var route = this.routes[routeName];

            if (route._i18n && route._i18n.routes && route._i18n.routes[lang]) {
                routeName = route._i18n.routes[lang].name;
            }

            return superUrl.apply(this, [routeName, params, options]);
        },

        path: function (routeName, params, options) {

            var lang;

            if (params && params.lang) {
                lang = params.lang;
            } else {
                lang = this.getLanguage()
            }

            var route = this.routes[routeName];

            if (route._i18n && route._i18n.routes && route._i18n.routes[lang]) {
                routeName = route._i18n.routes[lang].name;
            }

            return superPath.apply(this, [routeName, params, options]);
        },

        configure: function (options) {

            superConfigure.apply(this, [options]);

            if (!this.options.i18n) {
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

        },

        dispatch: function (path, options, cb) {

            var langCode;

            if (Meteor.server) {
                this.response = options.response;
                this.request = options.request;
                this.next = options.next;
            }

            this._i18n.origPath = path;

            if (this.options.i18n.getLangCode) {
                langCode = this.options.i18n.getLangCode.apply(this, [path, this.options]);
            }

            if (!langCode) {

                this.initalLangCodeMissing = true;

                if (_.isFunction(this.options.i18n.missingLangCodeAction)) {
                    if (this.options.i18n.missingLangCodeAction.apply(this, [path, this.options])) {
                        return;
                    }
                }

            } else {

                if (this.options.i18n.langCodeAction) {
                    this.options.i18n.langCodeAction.apply(this, [path, this.options]);
                }

                if (this.options.i18n.rewritePath) {
                    path = this.options.i18n.rewritePath.apply(this, [path, this.options]);
                }

            }

            superDispatch.apply(this, [path, options, cb]);
        },

        onRouteNotFound: function (path, options) {
            superOnRouteNotFound.apply(this, [this.getOrigPath(), options]);
        },

        getOrigPath: function () {
            return this._i18n.origPath;
        }

    });

    Router._i18n.languageDep = new Deps.Dependency();

})();

Meteor.startup(function () {

    var routeCount = Router.routes.length;

    for (var n = 0; n < routeCount; n++) {

        var route = Router.routes[n];

        if (!route._i18n) {

            Router._i18n.configI18nRoute(route);

        }


    }

});



