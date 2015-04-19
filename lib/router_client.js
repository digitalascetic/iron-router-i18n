var superInit = Router.init;

var superGo = Router.go;

var Url = Iron.Url;
var assert = Iron.utils.assert;

// Thanks to http://www.w3schools.com/js/js_cookies.asp :-)
function setCookie(cname, cvalue, microsecs, path) {
    path = path || '/';
    var d = new Date();
    d.setTime(d.getTime() + microsecs);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=" + path;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}


initi18n = function (options) {

    // Default missingLangCodeAction
    this._i18n.hooks.missingLangCodeAction = function (url) {

        var lang = this.getLanguage();

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
        if (controller) {
            var currentRoute = controller.route;
            this.go(currentRoute.getName(), currentRoute.params(controller.url), {lang: lang});
        }

    };

    this._i18n.hooks.persistLanguage = function (lang) {

        if (lang) {

            var expire = 2147483647;

            if (this.options.i18n.persistCookieExpiration) {

                if (_.isFunction(this.options.i18n.persistCookieExpiration)) {
                    expire = this.options.i18n.persistCookieExpiration.call(this);
                } else {
                    expire = this.options.i18n.persistCookieExpiration;
                }

                setCookie('martino:iron-router-i18n:lang', lang, expire);
            }

        }

        return getCookie('martino:iron-router-i18n:lang');


    };


    // Longest expiration, see http://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
    this._i18n.hooks.persistCookieExpiration = 2147483647;


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


Meteor.startup(function () {

    if (!Router.options.i18n.i18nConf && !Router.options.i18n.persistLanguage() && Router.options.i18n.autoConfLanguage) {

        // See https://alicoding.com/detect-browser-language-preference-in-firefox-and-chrome-using-javascript/
        var navLang = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);

        Router.setMatchingLanguage(navLang);

    }

});

Iron.Router.prototype.go = Router.go;
Iron.Router.prototype.init = Router.init;