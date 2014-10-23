(function () {


    _.extend(Router._i18n.hooks, {

        client: {

            missingLangCodeAction: function (path, options) {
                var lang = this.getLanguage();
                if (lang) {
                    this.go('/' + lang + path);
                    return true;
                } else {
                    console.log("Can't retrieve current language on " + this.getEnv() + ".");
                    return false;
                }

            },

            setLangCode: function (lang, options) {

                var controller = this._currentController;
                var currentRoute = controller.route;
                var routeForLang = currentRoute.getRouteForLang(lang);
                if (routeForLang) {
                    this.go(routeForLang.name, currentRoute.params(controller.path));
                }

            }

        }


    });

}());

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
