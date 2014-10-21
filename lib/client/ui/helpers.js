var origPathFor = Router.helpers.pathFor;
var origUrlFor = Router.helpers.urlFor;


Router.helpers.i18nPathFor = function (routeName, options) {
    Router._i18n.languageDep.depend();
    return origPathFor.apply(this, [routeName, options]);
};

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
UI.registerHelper('pathFor', Router.helpers.i18nPathFor);


Router.helpers.i18nURLFor = function (routeName, options) {
    Router._i18n.languageDep.depend();
    return origUrlFor.apply(this, [routeName, options]);
};

/**
 * Overrides iron:router urlFor helper making it reactive on router language change.
 *
 * Same as pathFor but returns entire absolute url.
 */
UI.registerHelper('urlFor', Router.helpers.i18nURLFor);
