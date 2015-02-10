var origPath = Iron.Route.prototype.path;
/*
 Iron.Route.prototype.path = function (params, options) {

 var path = origPath.call(this, params, options);
 var langCode = options && options.lang ? options.lang : this.router.getLanguage();
 path = '/' + langCode + path;
 return path;

 };
 */
Iron.Route.prototype.getDefaultRoute = function () {

    if (this._i18n && this._i18n.defaultRoute) {
        return this._i18n.defaultRoute;
    }

    return this;
}

Iron.Route.prototype.getRouteForLang = function (lang) {

    return this._i18n.routes[lang];

}