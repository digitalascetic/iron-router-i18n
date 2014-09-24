(function () {

    var origPath = Route.prototype.path;
    var origNormalizePath = Route.prototype.normalizePath;

    Route.prototype.path = function (params, options) {

        var path = origPath.apply(this, [params, options]);
        var langCode = params && params.lang ? params.lang : Router.getLanguage();
        path = '/' + langCode + path;
        return path;

    };

    Route.prototype.normalizePath = function (path) {

        var normalizedPath = origNormalizePath.apply(this, [path]);
        normalizedPath = Router.options.i18n.rewritePath(normalizedPath, Router.options);
        return normalizedPath;

    };

}());
