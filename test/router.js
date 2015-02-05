var initRouter = function () {

    var router = new I18NRouter({autoRender: false, autoStart: false});

    return router;

}

var defaultConf = function (router) {

    router.configure({

        i18n: {

            defaultLanguage: 'es',

            languages: ['it', 'es', 'en']

        }

    });

}

/*****************************************************************************/
/* Server and Client */
/*****************************************************************************/

if (Meteor.isClient) {

    Tinytest.add('Router i18n - test i18n Router configuration', function (test) {

        var router = initRouter();

        defaultConf(router);

        // Test configured options
        test.equal(router.options.i18n.defaultLanguage, 'es', 'Default language for client is not "es".');
        test.equal(router.options.i18n.languages[0], 'it', 'First language for client is not "it".');
        test.equal(router.options.i18n.languages[1], 'es', 'Second language for client is not "es".');
        test.equal(router.options.i18n.languages[2], 'en', 'Third language for client is not "en".');

        // Test default options
        test.equal(router.options.i18n.redirectCode, 301, 'Default redirect code is not 301.');
        test.isFalse(router.options.i18n.autoConfLanguage, 'Default value for autoCofLanguage is not "false" .');

    });
}

Tinytest.add('Router i18n - test i18n Router client/server configuration', function (test) {

    var router = initRouter();

    defaultConf(router);

    router.configure({

        i18n: {

            defaultLanguage: 'pt',

            client: {
                defaultLanguage: 'it'
            },

            server: {
                defaultLanguage: 'de'
            }

        }

    });


    if (Meteor.isServer) {
        test.equal(router.options.i18n.defaultLanguage, 'de', 'Default language for server is not "de" as overridden by server configuration.');
    } else {
        test.equal(router.options.i18n.defaultLanguage, 'it', 'Default language for client is not "it" as overridden by client configuration.');
    }

});

if (Meteor.isClient) {
//TODO: Review server side part
    Tinytest.add('Router i18n - test i18n missingLangCodeAction call', function (test) {

        var router = initRouter();

        var clientMissingLangCodeAction = false;

        defaultConf(router);

        router.configure({

            i18n: {

                serverSide: false,

                client: {
                    missingLangCodeAction: function (path, options) {
                        clientMissingLangCodeAction = true;
                        return true;
                    }
                }
            }

        });

        router.route('/missingLangCodeRoute');

        router.dispatch('/missingLangCodeRoute', null, null);
        test.isTrue(clientMissingLangCodeAction, 'Client configured missingLangCodeAction was not called.');


    });


    Tinytest.add('Router i18n - test i18n route configuration (legacy)', function (test) {

        var router = initRouter();

        defaultConf(router);

        router.route('test-i18n',
            {
                path: '/test-i18n'
            }
        );

        router.route('about',
            {
                path: '/about',
                layoutTemplate: 'base_layout',

                i18n: {
                    languages: {
                        it: {
                            path: '/chi-siamo',
                            template: 'about_it_template'
                        },
                        es: {
                            path: '/quienes-somos',
                            layoutTemplate: 'es_layout'
                        }
                    }
                }

            });

        test.isFalse(_.isUndefined(router.routes['about']), 'Route name "about" was not found.');
        test.equal(router.routes['about'].options.layoutTemplate, 'base_layout', 'Base layout of route "about" is not "base_layout".');

        test.isFalse(_.isUndefined(router.routes['about_it']), 'Route "about_it" does not exists.');
        test.equal(router.routes['about_it'].options.layoutTemplate, 'base_layout', 'Base layout of route "about_it" is not inherited as "base_layout".');
        test.equal(router.routes['about_it'].options.template, 'about_it_template', 'Template for route "about_it" is not overridden "about_it_template"');

        test.isFalse(_.isUndefined(router.routes['about_es']), 'Route "about_es" does not exists.');
        test.equal(router.routes['about_es'].options.layoutTemplate, 'es_layout', 'Base layout of route "about_es" is not overridden as "es_layout".');

    });


    Tinytest.add('Router i18n - test Router language methods', function (test) {

        var router = initRouter();

        router.configure({
            i18n: {}
        })

        test.equal(router.getDefaultLanguage(), 'en', 'Router default language is not "en".')

        router = initRouter();

        router.configure({
            i18n: {
                defaultLanguage: 'es'
            }
        });


        test.equal(router.getDefaultLanguage(), 'es', 'Router default language after changing "defaultLanguage" conf option is not "es".');

        // Testing getLanguage
        test.equal(router.getLanguage(), 'es', 'Router language is not "es" when having defaultLanguage "es".');

        //Testing language change
        router.setLanguage('it');
        test.equal(router.getLanguage(), 'it', 'Router did not change language to "it"');


        // Testing custom getDefaultLanguage method
        router = initRouter();

        router.configure({
            i18n: {
                getDefaultLanguage: function () {
                    return 'en';
                }
            }
        });

        test.equal(router.getDefaultLanguage(), 'en', 'Router default language is not "en" after setting getDefaultLanguage method.')

    });


    Tinytest.add('Router i18n - test default language prefix strategy', function (test) {

        var router = initRouter();

        defaultConf(router);

        var testRouteMatched = false;

        var resetRouter = function () {
            testRouteMatched = false;
        }

        router.route('test-i18n',
            {
                path: '/test-i18n',
                action: function () {
                    testRouteMatched = true;
                }

            }
        );


        router.dispatch('/es/test-i18n');
        test.isTrue(testRouteMatched, '/test-i18n route not matched for /es/test-i18n');
        test.equal(router.getOrigPath(), '/es/test-i18n', 'Original path is not preserved as /es/test-i18n');
        resetRouter();


        router.dispatch('/en/test-i18n');
        test.isTrue(testRouteMatched, '/test-i18n route not matched for /en/test-i18n');
        test.equal(router.getOrigPath(), '/en/test-i18n', 'Original path is not preserved as /en/test-i18n');
        resetRouter();


        router.dispatch('/it/test-i18n');
        test.isTrue(testRouteMatched, '/test-i18n route not matched for /it/test-i18n');
        test.equal(router.getOrigPath(), '/it/test-i18n', 'Original path is not preserved as /it/test-i18n');
        resetRouter();


        // Testing missingLangCodeAction

        // Lang code "de" not in allowed languages
        /*
         router.dispatch('/de/test-i18n');
         test.isTrue(TestRouter.onRouteNotFoundCalled, '/test-i18n route matched for /de/test while "de" not allowed language');
         test.equal(TestRouter.missingPath, '/de/test-i18n', '/test-i18n route matched for /de/test-i18n while de not allowed language');
         resetVars();


         // Lang code missing
         router.dispatch('/test-i18n');
         test.isTrue(TestRouter.missingLangCodeAction, '/test-i18n: missingLangCodeAction not called on route without lang code');
         resetVars();
         */

    });

    Tinytest.add('Router i18n - test custom routes i18n paths', function (test) {

        var testRouteMatchedEN = false;
        var testRouteMatchedES = false;
        var testRouteMatchedIT = false;
        var postId = null;

        var router;

        router = initRouter();

        defaultConf(router);

        var resetVars = function () {
            testRouteMatchedEN = false;
            testRouteMatchedES = false;
            testRouteMatchedIT = false;
            postId = null;
        }

        router.route('about',
            {
                path: '/about',
                action: function () {
                    testRouteMatchedEN = true;
                },

                i18n: {
                    languages: {
                        it: {
                            path: '/chi-siamo',
                            action: function () {
                                testRouteMatchedIT = true;
                            }
                        },
                        es: {
                            path: '/quienes-somos',
                            action: function () {
                                testRouteMatchedES = true;
                            }
                        }
                    }
                }

            });


        router.route('contact',
            {
                path: '/contact',
                action: function () {
                    testRouteMatchedEN = true;
                },

                i18n: {
                    languages: {
                        it: {
                            path: '/contatto',
                            action: function () {
                                testRouteMatchedIT = true;
                            }
                        }
                    }
                }

            });

        router.route('post',
            {
                path: '/post/:_id',
                action: function () {
                    testRouteMatchedEN = true;
                    postId = this.params._id;
                },

                i18n: {
                    languages: {
                        it: {
                            path: '/articolo/:_id',
                            action: function () {
                                testRouteMatchedIT = true;
                                postId = this.params._id;
                            }
                        }
                    }
                }

            });


        // Basic tests for i18n routes paths
        router.dispatch('/en/about');
        test.isTrue(testRouteMatchedEN, 'about route not matched for /en/about');
        test.equal(router.getOrigPath(), '/en/about', 'Original path is not preserved as /en/about');
        resetVars();


        router.dispatch('/it/chi-siamo');
        test.isTrue(testRouteMatchedIT, 'about_it route not matched for /it/chi-siamo');
        test.equal(router.getOrigPath(), '/it/chi-siamo', 'Original path is not preserved as /it/chi-siamo');
        resetVars();

        router.dispatch('/es/quienes-somos');
        test.isTrue(testRouteMatchedES, 'about_es route not matched for /es/quienes-somos');
        test.equal(router.getOrigPath(), '/es/quienes-somos', 'Original path is not preserved as /es/quienes-somos');
        resetVars();

        /*
         router.dispatch('/it/about');
         test.isTrue(TestRouter.onRouteNotFoundCalled, '/it/about route matched for "about" route while specific language path present');
         resetVars();
         */

        // Test mixed prefix/custom i18n path routes
        router.dispatch('/en/contact');
        test.isTrue(testRouteMatchedEN, 'contact route not matched for /en/contact');
        test.equal(router.getOrigPath(), '/en/contact', 'Original path is not preserved as /en/contact');
        resetVars();

        router.dispatch('/it/contatto');
        test.isTrue(testRouteMatchedIT, 'contact_it route not matched for /it/contatto');
        test.equal(router.getOrigPath(), '/it/contatto', 'Original path is not preserved as /it/contatto');
        resetVars();

        router.dispatch('/es/contact');
        test.isTrue(testRouteMatchedEN, 'about_es route not matched for /es/contact');
        test.equal(router.getOrigPath(), '/es/contact', 'Original path is not preserved as /es/contact');
        test.equal(router.getLanguage(), 'es', '"es" not set as language for route /es/contact');
        resetVars();


        // Test mixed custom i18n path routes with parameters
        router.dispatch('/en/post/34');
        test.isTrue(testRouteMatchedEN, 'contact route not matched for /en/post/34');
        test.equal(router.getOrigPath(), '/en/post/34', 'Original path is not preserved as /en/post/34');
        test.equal(postId, "34", 'Post id not identified as "34" for /en/post/34');
        resetVars();

        router.dispatch('/it/articolo/34');
        test.isTrue(testRouteMatchedIT, 'contact route not matched for /it/articolo/34');
        test.equal(router.getOrigPath(), '/it/articolo/34', 'Original path is not preserved as /it/articolo/34');
        test.equal(postId, "34", 'Post id not identified as "34" for /it/articolo/34');
        resetVars();

    });


}


/*




 */
/*****************************************************************************/
/* Client */
/*****************************************************************************/

/*
 if (Meteor.isClient) {





 Tinytest.add('Router i18n - test helpers', function (test) {

 TestRouter.initRouter();

 Router.route('test-i18n',
 {
 path: '/test-i18n'
 }
 );

 Router.route('about',
 {
 path: '/about',

 i18n: {
 languages: {
 it: {
 path: '/chi-siamo'
 },
 es: {
 path: '/quienes-somos'
 }
 }
 }

 });

 test.equal(Router.helpers.i18nPathFor('test-i18n', {}), '/en/test-i18n', 'en/test-i18n was not the result when calling pathFor with empty options.');
 TestRouter.resetVar();

 test.equal(Router.helpers.i18nPathFor('test-i18n', { hash: { lang: 'it'}}), '/it/test-i18n', '/it/test-i18n was not the result when calling pathFor with lang = it option');
 TestRouter.resetVar();

 test.equal(Router.helpers.i18nPathFor('about', {}), '/en/about', '/en/about was not the result when calling pathFor with empty options.');
 TestRouter.resetVar();

 test.equal(Router.helpers.i18nPathFor('about', { hash: { lang: 'it'}}), '/it/chi-siamo', '/it/chi-siamo was not the result when calling pathFor with lang = it option');
 TestRouter.resetVar();

 test.equal(Router.helpers.i18nPathFor('about', { hash: { lang: 'es'}}), '/es/quienes-somos', '/es/quienes-somos was not the result when calling pathFor with lang = es option');
 TestRouter.resetVar();


 test.equal(Router.helpers.i18nURLFor('test-i18n', {}), 'http://localhost:3000/en/test-i18n', 'http://localhost:3000/en/test-i18n was not the result when calling pathFor with empty options.');
 TestRouter.resetVar();

 test.equal(Router.helpers.i18nURLFor('test-i18n', { hash: { lang: 'it'}}), 'http://localhost:3000/it/test-i18n', 'http://localhost:3000/it/test-i18n was not the result when calling pathFor with lang = it option');
 TestRouter.resetVar();

 test.equal(Router.helpers.i18nURLFor('about', {}), 'http://localhost:3000/en/about', 'http://localhost:3000/en/about was not the result when calling pathFor with empty options.');
 TestRouter.resetVar();

 test.equal(Router.helpers.i18nURLFor('about', { hash: { lang: 'it'}}), 'http://localhost:3000/it/chi-siamo', 'http://localhost:3000/it/test-i18n was not the result when calling pathFor with lang = it option');
 TestRouter.resetVar();

 test.equal(Router.helpers.i18nURLFor('about', { hash: { lang: 'es'}}), 'http://localhost:3000/es/quienes-somos', 'http://localhost:3000/it/test-i18n was not the result when calling pathFor with lang = es option');
 TestRouter.resetVar();


 });


 Tinytest.add('Router i18n - test i18n template name resolution', function (test) {

 TestRouter.initRouter();

 Router.route('test-i18n',
 {
 path: '/test-i18n'
 }
 );

 Router.route('about',
 {
 path: '/about',
 layoutTemplate: 'base_layout',

 i18n: {
 languages: {
 it: {
 path: '/chi-siamo',
 template: 'about_it_template'
 },
 es: {
 path: '/quienes-somos',
 layoutTemplate: 'es_layout'
 }
 }
 }

 });

 var controller;

 controller = new RouteController(Router, Router.routes['about'], {});
 test.equal(controller.lookupTemplate(), 'about', 'Template is not "about" for default route.');

 controller = new RouteController(Router, Router.routes['about_es'], {});
 test.equal(controller.lookupTemplate(), 'about', 'Template is not "about" for es route.');

 controller = new RouteController(Router, Router.routes['about_it'], {});
 test.equal(controller.lookupTemplate(), 'about_it_template', 'Template is not about "about_it_template" for it route.');


 });

 }

 */