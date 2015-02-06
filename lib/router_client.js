var superDispatch = Iron.Router.prototype.dispatch;

var superInit = I18NRouter.prototype.init;

I18NRouter.prototype.init = function (options) {

    superInit.call(this, options);

    // Default missingLangCodeAction

    this._i18n.missingLangCodeAction = function (path, options) {
        var lang = this.getLanguage();
        if (lang) {
            this.go('/' + lang + path);
            return true;
        } else {
            console.log("Can't retrieve current language on " + this.getEnv() + ".");
            return false;
        }

    }

    // Default setLangCode action

    this._i18n.setLangCode = function (lang, options) {

        var controller = this.current();
        var currentRoute = controller.route;
        var routeForLang = currentRoute.getRouteForLang(lang);
        if (routeForLang) {
            this.go(routeForLang.getName(), currentRoute.params(controller.url));
        }

    }

}


I18NRouter.prototype.dispatch = function (url, context, done) {

    var langCode;

    if (this.options.i18n.getLangCode) {
        langCode = this.options.i18n.getLangCode.apply(this, [url, this.options]);
    }

    if (!langCode) {

        if (_.isFunction(this.options.i18n.missingLangCodeAction)) {
            if (this.options.i18n.missingLangCodeAction.apply(this, [url, this.options])) {
                return;
            }
        }

    } else {

        if (this.options.i18n.langCodeAction) {
            this.options.i18n.langCodeAction.apply(this, [url, this.options]);
        }

        if (this.options.i18n.rewritePath) {
            this._i18n.origPath = url;
            url = this.options.i18n.rewritePath.apply(this, [url, this.options]);
        }

    }

    superDispatch.call(this, url, context, done);

};
/*
 Meteor.startup(function () {

 if (Router.options.i18n.autoConfLanguage) {
 var lang;
 if (_.contains(Router.options.i18n.languages, navigator.language)) {
 lang = navigator.language;
 } else {
 lang = Router.getDefaultLanguage();
 }
 Router.setLanguage(lang);
 }

 });
 */