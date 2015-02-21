var locale = Npm.require('locale');

var supported;
var locales;

var superDispatch = Router.dispatch;
var superInit = Router.init;

function getEnv() {
    return Meteor.isClient ? 'client' : 'server';
}

Router.dispatch = function (url, context, done) {

    if (this.options.i18n.autoConfLanguage) {

        locales = new locale.Locales(context.request.headers["accept-language"]);
        var lang = locales.best(supported);
        if (!lang) {
            lang = this.getDefaultLanguage();
        }
        this.setLanguage(lang);

    }

    return superDispatch.call(this, url, context, done);

};


initi18n = function(options) {
    // Default missingLangCodeAction for server
    this._i18n.missingLangCodeAction = function (path, options) {
        if (options.i18n.serverSide) {
            var self = this;
            var lang = self.getLanguage();
            if (lang) {
                self.stop();
                self.response.writeHead(options.i18n.redirectCode, {"Location": Meteor.absoluteUrl() + lang + path});
                return self.response.end();
            } else {
                console.log("Can't retrieve current language on " + this.getEnv() + ".");
                return false;
            }
        }

    }
};

Router.init = function (options) {

    superInit.call(this, options);

    return initi18n.call(this, options);

};


Meteor.startup(function () {

    if (Router.options.i18n.autoConfLanguage) {
        supported = new locale.Locales(Router.options.i18n.languages);
        locale.Locale["default"] = new locale.Locale(Router.getDefaultLanguage() || "en");
    }

});

Iron.Router.prototype.dispatch = Router.dispatch;
Iron.Router.prototype.init = Router.init;