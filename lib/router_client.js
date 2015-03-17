var superInit = Router.init;

var superGo = Router.go;

var Url = Iron.Url;
var assert = Iron.utils.assert;

initi18n = function (options) {

    // Default missingLangCodeAction
    this._i18n.hooks.missingLangCodeAction = function (url) {

        var lang = this.getLanguage();

        var path = Url.normalize(url);

        if (lang) {
            this.go('/' + lang + path, [], {isLangCodeMissing: true});
            return true;
        } else {
            console.log("Can't retrieve current language on " + this.getEnv() + ".");
            return false;
        }


    };

    // Default setLangCode action
    this._i18n.hooks.setLangCode = function (lang) {

        var controller = this.current();
        if (controller) {
            var currentRoute = controller.route;
            this.go(currentRoute.getName(), currentRoute.params(controller.url), {lang: lang});
        }

    }

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


Meteor.startup(function () {

    if (Router.options.i18n.autoConfLanguage) {

        Router.setMatchingLanguage(navigator.language);

    }

});

Iron.Router.prototype.go = Router.go;
Iron.Router.prototype.init = Router.init;