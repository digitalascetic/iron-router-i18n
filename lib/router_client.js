var superInit = I18NRouter.prototype.init;

var Url = Iron.Url;


I18NRouter.prototype.init = function (options) {

    superInit.call(this, options);

    // Default missingLangCodeAction
    this._i18n.hooks.missingLangCodeAction = function (url) {

        var lang = this.getLanguage();

        var path = Url.normalize(url);

        if (lang) {
            this.go('/' + lang + path);
            return true;
        } else {
            console.log("Can't retrieve current language on " + this.getEnv() + ".");
            return false;
        }


    }

    // Default setLangCode action
    this._i18n.hooks.setLangCode = function (lang) {

        var controller = this.current();
        if (controller) {
            var currentRoute = controller.route;
            var routeForLang = currentRoute.getRouteForLang(lang);
            if (routeForLang) {
                this.go(routeForLang.getName(), currentRoute.params(controller.url));
            }
        }

    }

}


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
