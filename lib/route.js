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

Iron.Route.prototype.path = function (routeName, params, options) {
  var route = this.routes[routeName];
  Iron.utils.warn(route, "You called Router.path for a route named " + JSON.stringify(routeName) + " but that route doesn't seem to exist. Are you sure you created it?");
  var lang = options && options.lang ? options.lang : this.getLanguage();
  var routeLang = route.getRouteForLang(lang);
  return routeLang && routeLang.path(params, options);
};