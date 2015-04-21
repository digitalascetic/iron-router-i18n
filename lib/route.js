var superGetName = Iron.Route.prototype.getName;

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


Iron.Route.prototype.getName = function () {

    var defaultRoute = this.getDefaultRoute();
    var route = defaultRoute ? defaultRoute : this;
    return superGetName.call(route);

};

Iron.Route.prototype.getI18nName = function () {

    return superGetName.call(this);

};

Iron.Route.prototype.isI18nExcluded = function () {

    return route._i18n.excluded;

};

Iron.Route.prototype.path = function (params, options) {
    var route;
    if (options && options.origRoute) {
        if (this.router.options.i18n.langCodeForDefaultLanguage) {
            route = this.origRoute;
        } else {
            route = this.getDefaultRoute();
        }
    } else {
        var lang = options && options.lang ? options.lang : this.router.getLanguage();
        route = this.getRouteForLang(lang);
    }
    return route.handler.resolve(params, options);
}
;