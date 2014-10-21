(function () {

    var locale = Npm.require('locale');
    var superDispatch = Router.dispatch;
    var supported;
    var locales;

    _.extend(Router, {

        dispatch: function (path, options, cb) {

            if (Router.options.i18n.autoInitLanguage) {

                locales = new locale.Locales(options.request.headers["accept-language"]);
                var lang = locales.best(supported);
                if (!lang) {
                    lang = this.getDefaultLanguage();
                }
                this.setLanguage(lang);

            }
            superDispatch.apply(this, [path, options, cb]);

        }

    });

    _.extend(Router._i18n.hooks, {

        server: {

            missingLangCodeAction: function (path, options) {
                if (options.i18n.serverSide) {
                    var self = this;
                    var lang = self.getLanguage();
                    if (lang) {
                        self.stop();
                        self.response.writeHead(options.i18n.redirectCode, {"Location": Meteor.absoluteUrl() + lang + path});
                        return response.end();
                    } else {
                        console.log("Can't retrieve current language on " + this.getEnv() + ".");
                    }
                }


            }

        }

    });

    Meteor.startup(function () {
        if (Router.options.i18n.autoInitLanguage) {
            supported = new locale.Locales(Router.options.i18n.languages);
            locale.Locale["default"] = new locale.Locale(Router.getDefaultLanguage() || "en");
        }
    });

}());
