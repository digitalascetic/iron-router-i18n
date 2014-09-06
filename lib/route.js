(function () {

    var origPath = Route.prototype.path;

    Route.prototype.path = function (params, options) {

        var path = origPath.apply(this, [params, options]);
        var langCode = params.lang ? params.lang : Router.getLanguage();
        path = '/' + langCode + path;
        return path;

    };

}());
