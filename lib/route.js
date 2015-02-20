Iron.Route.prototype.getDefaultRoute = function () {

    if (this._i18n && this._i18n.defaultRoute) {
        return this._i18n.defaultRoute;
    }

    return this;
};

Iron.Route.prototype.getRouteForLang = function (lang) {

    if (this._i18n.routes) {
        return this._i18n.routes[lang];
    } else {
        return this._i18n.defaultRoute._i18n.routes[lang];
    }

};

/**
 * Returns a relative path for the route.
 */
Iron.Route.prototype.path = function (params, options) {
  var lang = options && options.lang ? options.lang : this.router.getLanguage();
  var route = this.getRouteForLang(lang);
  return route.handler.resolve(params, options);
};