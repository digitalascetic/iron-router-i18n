(function () {


    _.extend(Router._i18n.hooks, {

        missingLangCodeAction: function (path, options) {
            var lang = this.getLanguage();
            if (lang) {
                this.go('/' + lang + path);
            } else {
                console.log("Can't retrieve current language on " + this.getEnv() + ".");
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


    });

    Router.languageDep = new Deps.Dependency();

}());
