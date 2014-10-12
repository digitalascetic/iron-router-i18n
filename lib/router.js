(function () {

    getEnv = function () {
        return Meteor.isClient ? 'client' : 'server';
    };

    var superDispatch = Router.dispatch;

    var superRoute = Router.route;

    var superPath = Router.path;

    var superOnRouteNotFound = Router.onRouteNotFound;

    var superConfigure = Router.configure;

    _.extend(Router, {

        _i18n: {

            language: 'en',

            origPath: null,

            hooks: {

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

                missingLangCodeAction: function (path, options) {
                    if (options.i18n.getLanguage) {
                        var lang = options.i18n.getLanguage();
                        if (lang) {
                            if (Meteor.isClient) {
                                Router.go('/' + lang + path);
                            }
                        } else {
                            console.log("Can't redirect to i18n path, no current language set on " + getEnv() + ".");
                        }
                    } else {
                        console.log("Can't retrieve current language: missing Router.options.i18n.getLanguage function on " + getEnv() + ".");
                    }
                },

                langCodeAction: function (path, options) {
                    var env = Meteor.isClient ? 'client' : 'server';
                    var langCode = options.i18n.getLangCode(path, options);
                    if (options.i18n.getLanguage) {
                        var lang = options.i18n.getLanguage();
                        if (langCode != lang) {
                            options.i18n.setLanguage(langCode);
                        }
                    } else {
                        console.log("Can't retrieve current language: missing Router.options.i18n.getLanguage function on " + getEnv() + ".")
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

                setLangCode: function (lang, options) {

                    var currentRoute = Router.current().route;
                    var routeForLang = currentRoute.getRouteForLang(lang);

                    options.i18n.setLanguage(lang);

                    if (routeForLang) {

                        if (Meteor.isClient) {
                            Router.go(routeForLang.name, currentRoute.params(Router.current().path));
                        }

                    }

                },

                getDefaultLanguage: function () {
                    return this.language;
                }

            }
        },

        setLanguage: function (lang) {
            if (this.options.i18n.setLangCode) {
                this.options.i18n.setLangCode(lang, this.options);
            }
            this.languageDep.changed();
        },

        getLanguage: function () {
            return this.options.i18n.getLanguage();
        },

        getDefaultLanguage: function () {
            return this.options.i18n.getLanguage();
        },

        languageDep: null,

        routeIsName: false,

        route: function (name, options) {

            var route;

            var routerLanguages = this.options.i18n.languages;
            var defaultRoute;

            if (!options.i18n) {
                route = superRoute.apply(this, [name, options]);
                route._i18n = {};
                route._i18n.langs = routerLanguages;
                return route;
            }

            var configuredLanguageRoutes = options.i18n.languages;
            var routeLanguages = options.i18n.limitToSpecified ? _.keys(configuredLanguageRoutes) : routerLanguages;
            var defaultRouteLanguages = _.difference(routeLanguages, _.keys(configuredLanguageRoutes));

            defaultRoute = superRoute.apply(this, [name, options]);
            defaultRoute._i18n = {};
            defaultRoute._i18n.routes = {};
            defaultRoute._i18n.langs = defaultRouteLanguages;

            for (var lang in configuredLanguageRoutes) {
                var i18n_options = _.clone(options);
                _.extend(i18n_options, configuredLanguageRoutes[lang]);
                //var i18n_name = name;
                //i18n_options.path = configuredLanguageRoutes[lang].path ? configuredLanguageRoutes[lang].path : options.path;
                route = superRoute.apply(this, [name + '_' + lang, i18n_options]);
                route._i18n = {};
                route._i18n.langs = [ lang ];
                route._i18n.defaultRoute = defaultRoute;
                defaultRoute._i18n.routes[lang] = route;
            }


            return defaultRoute;

        },

        match: function (path) {
            return _.find(this.routes, function (r) {
                if (r.test(path)) {
                    return r.matchLang(r.router.getLanguage());
                }
            });
        },

        path: function (routeName, params, options) {

            var lang = this.getLanguage();

            var route = this.routes[routeName];

            if (route._i18n && route._i18n.routes && route._i18n.routes[lang]) {
                routeName = route._i18n.routes[lang].name;
            }

            return superPath.apply(this, [routeName, params, options]);
        },

        configure: function(options) {

            superConfigure.apply(this, [options]);
            _.extend(this._i18n.hooks, this.options.i18n);
            _.extend(this.options.i18n, this._i18n.hooks);

            return this;

        },

        dispatch: function (path, options, cb) {

            var langCode;

            this._i18n.origPath = path;

            if (this.options.i18n.getLangCode) {
                langCode = this.options.i18n.getLangCode(path, this.options);
            }

            if (!langCode) {

                if (this.options.i18n.missingLangCodeAction) {
                    this.options.i18n.missingLangCodeAction(path, this.options);
                }

            } else {

                if (this.options.i18n.langCodeAction) {
                    this.options.i18n.langCodeAction(path, this.options);
                }

                if (this.options.i18n.rewritePath) {
                    path = this.options.i18n.rewritePath(path, this.options);
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

    Router.languageDep = new Deps.Dependency();

    Router.configure({
        i18n: {}
    });

})();




