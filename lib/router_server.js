var supported;
var locales;

var superInit = Router.init;

function getEnv() {
    return Meteor.isClient ? 'client' : 'server';
}

initi18n = function(options) {

    // Default missingLangCodeAction for server
    this._i18n.missingLangCodeAction = function (path, options) {
        if (options.i18n.serverSide) {
            var self = this;
            var lang = I18NConf.getLanguage();
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

Iron.Router.prototype.dispatch = Router.dispatch;
Iron.Router.prototype.init = Router.init;