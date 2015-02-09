var origPath = Iron.Route.prototype.path;

Iron.Route.prototype.path = function (params, options) {

    var path = origPath.call(this, params, options);
    var langCode = options && options.lang ? options.lang : this.router.getLanguage();
    path = '/' + langCode + path;
    return path;

};

Iron.Route.prototype.getDefaultRoute = function () {

    if (this._i18n && this._i18n.defaultRoute) {
        return this._i18n.defaultRoute;
    }

    return this;
}

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