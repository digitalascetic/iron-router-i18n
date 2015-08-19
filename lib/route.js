var superGetName = Iron.Route.prototype.getName;

Iron.Route.prototype.getRouteForLang = function (lang) {

    if (this._i18n.excluded) {
        return this;
    }

    if (this._i18n.routes) {
        return this._i18n.routes[lang];
    } else {
        return this._i18n.defaultRoute._i18n.routes[lang];
    }

};


Iron.Route.prototype.getName = function () {

    var route = this._i18n && this._i18n.defaultRoute ? this._i18n.defaultRoute : this;
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
            route = this._i18n.origRoute;
        } else {
            route = this._i18n.defaultRoute;
        }
    } else {
        var lang = options && options.lang ? options.lang : I18NConf.getLanguage();
        route = this.getRouteForLang(lang);
    }
    return route.handler.resolve(params, options);
}
;