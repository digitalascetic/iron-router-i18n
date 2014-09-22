var origPathFor = Router.helpers.pathFor;
var origUrlFor = Router.helpers.urlFor;

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
    Router.languageDep.depend();
    return origPathFor.apply(this, [routeName, options]);
});

/**
 * Overrides iron:router urlFor helper making it reactive on router language change.
 *
 * Same as pathFor but returns entire absolute url.
 */
UI.registerHelper('urlFor', function (routeName, options) {
    Router.languageDep.depend();
    return origUrlFor(this, [routeName, options]);
});
