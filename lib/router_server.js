var locale = Npm.require('locale');

var supported;
var locales;

var superDispatch = I18NRouter.prototype.dispatch;
var superInit = I18NRouter.prototype.init;

function getEnv() {
    return Meteor.isClient ? 'client' : 'server';
};

I18NRouter.prototype.dispatch = function (url, context, done) {

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

I18NRouter.prototype.init = function (options) {

    superInit.call(this, options);

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

}


Meteor.startup(function () {

    if (Router.options.i18n.autoConfLanguage) {
        supported = new locale.Locales(Router.options.i18n.languages);
        locale.Locale["default"] = new locale.Locale(Router.getDefaultLanguage() || "en");
    }

});
