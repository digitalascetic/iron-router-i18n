(function () {

    var origDispatch = Router.dispatch;

    _.extend(Router, {

        _i18n: {

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
                            console.log("Can't redirect to i18n path, no current language set.");
                        }
                    } else {
                        console.log("Can't retrieve current language: missing Router.options.i18n.getLanguage function.");
                    }
                },

                langCodeAction: function (path, options) {
                    var langCode = options.i18n.getLangCode(path, options);
                    if (options.i18n.getLanguage) {
                        var lang = options.i18n.getLanguage();
                        if (langCode != lang) {
                            options.i18n.setLanguage(langCode);
                        }
                    } else {
                        console.log("Can't retrieve current language: missing Router.options.i18n.getLanguage function.")
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

                    var currentPath = Router.current().path;
                    var langSepPos = 1;
                    var langCode = options.i18n.getLangCode(currentPath, options);

                    if (langCode) {
                        currentPath = currentPath.substring(langCode.length + 1);
                    }

                    options.i18n.setLanguage(lang);

                    if (Meteor.isClient) {
                        Router.go('/' + lang + currentPath);
                    }

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

        languageDep: null,


        dispatch: function (path, options, cb) {

            var langCode;

            this._i18n.origPath = path;

            if (!this.options.i18n.merged) {
                _.extend(this._i18n.hooks, this.options.i18n);
                _.extend(this.options.i18n, this._i18n.hooks);
                this.options.i18n.merged = true;
            }

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

            origDispatch.apply(this, [path, options, cb]);
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




