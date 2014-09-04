var origPathFor = Router.helpers.pathFor;

/**
 * Example Use:
 *
 *  {{pathFor 'items' params=this}}
 *  {{pathFor 'items' id=5 query="view=all" hash="somehash"}}
 *  {{pathFor route='items' id=5 query="view=all" hash="somehash"}}
 *  {{pathFor route='items' id=5 query="view=all" hash="somehash", lang="it"}}
 */
UI.registerHelper('pathFor', function (routeName, options) {
    Router._i18n.languageDep.depend();
    var path = origPathFor(routeName, options);
    var langCode = options.lang ? options.lang : Router.i18n.getLanguage();
    path = '/' + langCode + path;
    return path;
});
