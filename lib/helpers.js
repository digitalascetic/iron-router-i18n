var warn = Iron.utils.warn;

/**
 * Overrides iron:router pathFor helper making it reactive on router language change.
 * Adds the "lang" parameter to force language for path.
 *
 * Example Use:
 *
 *  {{pathFor 'items' params=this}}
 *  {{pathFor 'items' id=5 query="view=all" hash="somehash"}}
 *  {{pathFor route='items' id=5 query="view=all" hash="somehash"}}
 *  {{pathFor route='items' id=5 query="view=all" hash="somehash" lang="it"}}
 */

UI.registerHelper('pathFor', function (routeName, options) {

    Router.getLanguageDep().depend();

    var opts;

    if (typeof routeName === 'object') {
        opts = routeName.hash;
        routeName = opts.route;

    } else {
        opts = options && options.hash;
    }

    opts = opts || {};

    var path = '';
    var query = opts.query;
    var hash = opts.hash;
    var data = _.extend({}, opts.data || this);

    var defaultRoute = Router.routes[routeName];

    var lang = opts.lang || Router.getLanguage();

    var route = defaultRoute.getRouteForLang(lang);

    warn(route, "pathFor couldn't find a route named " + JSON.stringify(routeName));

    if (route) {
        _.each(route.handler.compiledUrl.keys, function (keyConfig) {
            var key = keyConfig.name;
            if (_.has(opts, key)) {
                data[key] = EJSON.clone(opts[key]);

                // so the option doesn't end up on the element as an attribute
                delete opts[key];
            }
        });

        path = route.path(data, {query: query, hash: hash});
    }

    return path;
});

/**
 * Returns a relative path given a route name, data context and optional query
 * and hash parameters.
 */
UI.registerHelper('urlFor', function (routeName, options) {

    Router.getLanguageDep().depend();

    var opts;

    if (typeof routeName == 'object') {
        opts = routeName;
        routeName = opts && opts.hash && opts.hash.route;
    } else {
        opts = options && options.hash
    }

    var opts = options && options.hash;

    opts = opts || {};
    var url = '';
    var query = opts.query;
    var hash = opts.hash;
    var data = _.extend({}, opts.data || this);

    var route = Router.routes[routeName];

    var lang = opts.lang || Router.getLanguage();

    route = route.getRouteForLang(lang);

    warn(route, "urlFor couldn't find a route named " + JSON.stringify(routeName));

    if (route) {
        _.each(route.handler.compiledUrl.keys, function (keyConfig) {
            var key = keyConfig.name;
            if (_.has(opts, key)) {
                data[key] = EJSON.clone(opts[key]);

                // so the option doesn't end up on the element as an attribute
                delete opts[key];
            }
        });

        url = route.url(data, {query: query, hash: hash});
    }

    return url;
});

/**
 * Create a link with optional content block.
 *
 * Example:
 *   {{#linkTo route="one" query="query" hash="hash" class="my-cls"}}
 *    <div>My Custom Link Content</div>
 *   {{/linkTo}}
 */
UI.registerHelper('linkTo', new Blaze.Template('linkTo', function () {

    Router.getLanguageDep().depend();

    var self = this;
    var opts = DynamicTemplate.getInclusionArguments(this);

    if (typeof opts !== 'object')
        throw new Error("linkTo options must be key value pairs such as {{#linkTo route='my.route.name'}}. You passed: " + JSON.stringify(opts));

    opts = opts || {};
    var path = '';
    var query = opts.query;
    var hash = opts.hash;
    var routeName = opts.route;
    var data = _.extend({}, opts.data || DynamicTemplate.getParentDataContext(this));
    var route = Router.routes[routeName];

    if (opts.lang) {
        route = route.getRouteForLang(opts.lang);
    }

    var paramKeys;

    warn(route, "linkTo couldn't find a route named " + JSON.stringify(routeName));

    if (route) {
        _.each(route.handler.compiledUrl.keys, function (keyConfig) {
            var key = keyConfig.name;
            if (_.has(opts, key)) {
                data[key] = EJSON.clone(opts[key]);

                // so the option doesn't end up on the element as an attribute
                delete opts[key];
            }
        });

        path = route.path(data, {query: query, hash: hash, lang: opts.lang});
    }

    // anything that isn't one of our keywords we'll assume is an attributed
    // intended for the <a> tag
    var attrs = _.omit(opts, 'route', 'query', 'hash', 'data');
    attrs.href = path;

    return Blaze.With(function () {
        return DynamicTemplate.getParentDataContext(self);
    }, function () {
        return HTML.A(attrs, self.templateContentBlock);
    });
}));
