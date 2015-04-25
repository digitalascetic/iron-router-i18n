var superInit = Router.init;

var superGo = Router.go;

var Url = Iron.Url;

var assert = Iron.utils.assert;


initi18n = function (options) {

    // Default missingLangCodeAction
    this._i18n.hooks.missingLangCodeAction = function (url) {

        var lang = I18NConf.getLanguage();

        var path = Url.normalize(url);

        if (lang) {
            this.go('/' + lang + (path !== '/' ? path : ''), [], {isLangCodeMissing: true});
            return true;
        } else {
            console.log("Can't retrieve current language on " + this.getEnv() + ".");
            return false;
        }


    };

    // Default setLangCode action
    this._i18n.hooks.setLangCode = function (lang) {

        var controller = this.current();
        if (controller && controller.route) {
            var currentRoute = controller.route;
            this.go(currentRoute.getName(), currentRoute.params(controller.url), {lang: lang});
        }

    };

};


Router.init = function (options) {

    superInit.call(this, options);

    initi18n.call(this, options);

};


Router.go = function (routeNameOrPath, params, options) {

    var isPath = /^\/|http/;
    var path;

    var lang = options && options.lang ? options.lang : this.getLanguage();

    this._i18n.isLangCodeMissing = options && options.isLangCodeMissing ? options.isLangCodeMissing : false;

    // If this "go" comes from a missingLangCode redirect just replace the current state to preserve
    // back button navigation (see #
    if (this._i18n.isLangCodeMissing) {
        options.replaceState = true;
    }

    if (isPath.test(routeNameOrPath)) {
        // it's a path!
        path = routeNameOrPath;
    } else {
        // it's a route name!
        var route = this.routes[routeNameOrPath];
        assert(route, "No route found named " + JSON.stringify(routeNameOrPath));
        var routeLang = route.getRouteForLang(lang);
        path = routeLang.getName();
    }

    superGo.call(this, path, params, options);

};

Iron.Router.prototype.go = Router.go;
Iron.Router.prototype.init = Router.init;