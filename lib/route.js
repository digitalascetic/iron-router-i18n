(function () {
    /*
     var origPath = Iron.Route.prototype.path;
     var origNormalizePath = Iron.Route.prototype.normalizePath;

     Iron.Route.prototype.path = function (params, options) {

     var path = origPath.apply(this, [params, options]);
     var langCode = params && params.lang ? params.lang : this.router.getLanguage();
     path = '/' + langCode + path;
     return path;

     };

     Iron.Route.prototype.normalizePath = function (path) {

     var normalizedPath = origNormalizePath.apply(this, [path]);
     normalizedPath = this.router.options.i18n.rewritePath(normalizedPath, this.router.options);
     return normalizedPath;

     };

     Iron.Route.prototype.matchLang = function (lang) {
     return _.contains(this._i18n.langs, lang);
     };

     Iron.Route.prototype.getRouteForLang = function (lang) {

     if (this.matchLang(lang)) {
     return this;
     }

     var childRoutes = this._i18n.routes;

     if (childRoutes) {
     for (var routeLang in childRoutes) {
     if (childRoutes[routeLang].matchLang(lang)) {
     return childRoutes[routeLang];
     }
     }
     }

     var defaultRoute = this._i18n.defaultRoute;

     if (defaultRoute) {
     if (defaultRoute.matchLang(lang)) {
     return defaultRoute;
     }
     }

     return null;
     }
     */

}());
