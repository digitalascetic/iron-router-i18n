var initRouter = function () {

    var router = new I18NRouter({autoRender: false, autoStart: false});

    return router;

}

var defaultConf = function (router) {

    router.configure({

        serverSide: true,

        i18n: {

            defaultLanguage: 'es',

            languages: ['it', 'es', 'en']

        }

    });

}

/*****************************************************************************/
/* Server and Client */
/*****************************************************************************/


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

Tinytest.add('Router i18n - test i18n missingLangCodeAction call', function (test) {

    var router = initRouter();

    var clientMissingLangCodeAction = false;

    defaultConf(router);

    router.configure({

        i18n: {

            serverSide: true,

            missingLangCodeAction: function (path, options) {
                clientMissingLangCodeAction = true;
                return true;
            }
        }

    });

    router.route('/missingLangCodeRoute');

    router.dispatch('/missingLangCodeRoute', null, null);
    test.isTrue(clientMissingLangCodeAction, 'Client configured missingLangCodeAction was not called.');


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
            defaultLanguage: 'es',

            languages: ['it', 'es', 'en']
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
            },

            languages: ['it', 'es', 'en']

        }
    });

    test.equal(router.getDefaultLanguage(), 'en', 'Router default language is not "en" after setting getDefaultLanguage method.')

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


function testDefaultLanguagePrefix(test, env) {

    var router = initRouter();

    defaultConf(router);

    var missingLangCodeAction = false;
    router.configure({
        i18n: {
            missingLangCodeAction: function () {
                missingLangCodeAction = true;
            }
        }
    });

    var testRouteMatched = false;

    var resetRouter = function () {
        testRouteMatched = false;
    }

    router.route('test-i18n',
        {
            path: '/test-i18n',
            action: function () {
                testRouteMatched = true;
            },

            where: env

        }
    );

    var res = {
        setHeader: function () {
        },
        end: function () {
        }
    };
    var next = function () {
    };

    var req = {url: '/es/test-i18n'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '/test-i18n route not matched for /es/test-i18n');
    test.equal(router.getOrigPath(), '/es/test-i18n', 'Original path is not preserved as /es/test-i18n');
    resetRouter();

    req = {url: '/en/test-i18n'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '/test-i18n route not matched for /en/test-i18n');
    test.equal(router.getOrigPath(), '/en/test-i18n', 'Original path is not preserved as /en/test-i18n');
    resetRouter();

    req = {url: '/it/test-i18n'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '/test-i18n route not matched for /it/test-i18n');
    test.equal(router.getOrigPath(), '/it/test-i18n', 'Original path is not preserved as /it/test-i18n');
    resetRouter();


    // Testing missingLangCodeAction

    // Lang code "de" not in allowed languages

    // router.dispatch('/de/test-i18n');
    //  test.isTrue(TestRouter.onRouteNotFoundCalled, '/test-i18n route matched for /de/test while "de" not allowed language');
    //  test.equal(TestRouter.missingPath, '/de/test-i18n', '/test-i18n route matched for /de/test-i18n while de not allowed language');
    //  resetRouter();


    // Lang code missing
    req = {url: '/test-i18n'};
    router(req, res, next);
    test.isTrue(missingLangCodeAction, '/test-i18n: missingLangCodeAction not called on route without lang code');


}


function testCustomPath(test, env) {

    "use strict";
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
            },

            where: env

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
            },

            where: env

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
            },

            where: env

        });


    // Basic tests for i18n routes paths

    var res = {
        setHeader: function () {
        },
        end: function () {
        }
    };
    var next = function () {
    };

    var req = {url: '/en/about'};
    router(req, res, next);
    test.isTrue(testRouteMatchedEN, 'about route not matched for /en/about');
    test.equal(router.getOrigPath(), '/en/about', 'Original path is not preserved as /en/about');
    resetVars();

    var req = {url: '/it/chi-siamo'};
    router(req, res, next);
    test.isTrue(testRouteMatchedIT, 'about_it route not matched for /it/chi-siamo');
    test.equal(router.getOrigPath(), '/it/chi-siamo', 'Original path is not preserved as /it/chi-siamo');
    resetVars();

    var req = {url: '/es/quienes-somos'};
    router(req, res, next);
    test.isTrue(testRouteMatchedES, 'about_es route not matched for /es/quienes-somos');
    test.equal(router.getOrigPath(), '/es/quienes-somos', 'Original path is not preserved as /es/quienes-somos');
    resetVars();

    /*
     router.dispatch('/it/about');
     test.isTrue(TestRouter.onRouteNotFoundCalled, '/it/about route matched for "about" route while specific language path present');
     resetVars();
     */

    // Test mixed prefix/custom i18n path routes
    var req = {url: '/en/contact'};
    router(req, res, next);
    test.isTrue(testRouteMatchedEN, 'contact route not matched for /en/contact');
    test.equal(router.getOrigPath(), '/en/contact', 'Original path is not preserved as /en/contact');
    resetVars();

    var req = {url: '/it/contatto'};
    router(req, res, next);
    test.isTrue(testRouteMatchedIT, 'contact_it route not matched for /it/contatto');
    test.equal(router.getOrigPath(), '/it/contatto', 'Original path is not preserved as /it/contatto');
    resetVars();

    var req = {url: '/es/contact'};
    router(req, res, next);
    test.isTrue(testRouteMatchedEN, 'about_es route not matched for /es/contact');
    test.equal(router.getOrigPath(), '/es/contact', 'Original path is not preserved as /es/contact');
    test.equal(router.getLanguage(), 'es', '"es" not set as language for route /es/contact');
    resetVars();


    // Test mixed custom i18n path routes with parameters

    var req = {url: '/en/post/34'};
    router(req, res, next);
    test.isTrue(testRouteMatchedEN, 'contact route not matched for /en/post/34');
    test.equal(router.getOrigPath(), '/en/post/34', 'Original path is not preserved as /en/post/34');
    test.equal(postId, "34", 'Post id not identified as "34" for /en/post/34');
    resetVars();

    var req = {url: '/it/articolo/34'};
    router(req, res, next);
    test.isTrue(testRouteMatchedIT, 'contact route not matched for /it/articolo/34');
    test.equal(router.getOrigPath(), '/it/articolo/34', 'Original path is not preserved as /it/articolo/34');
    test.equal(postId, "34", 'Post id not identified as "34" for /it/articolo/34');
    resetVars();


}

if (Meteor.isClient) {

    Tinytest.add('Router i18n - test default language prefix strategy', function (test) {

        testDefaultLanguagePrefix(test, 'client');

    });


    Tinytest.add('Router i18n - test custom routes i18n paths', function (test) {

        testCustomPath(test, 'client')

    });

    Tinytest.add('Router i18n - test helpers', function (test) {

        //Router = initRouter();

        defaultConf(Router);

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

        var pathFor = Blaze._globalHelpers['pathFor'];

        test.equal(pathFor('test-i18n', {}), '/es/test-i18n', 'es/test-i18n was not the result when calling pathFor with empty options.');

        test.equal(pathFor('test-i18n', {hash: {lang: 'it'}}), '/it/test-i18n', '/it/test-i18n was not the result when calling pathFor with lang = it option');

        test.equal(pathFor('about'), '/es/about', '/es/about was not the result when calling pathFor with empty options.');

        test.equal(pathFor('about', {hash: {lang: 'it'}}), '/it/chi-siamo', '/it/chi-siamo was not the result when calling pathFor with lang = it option');

        test.equal(pathFor('about', {hash: {lang: 'es'}}), '/es/quienes-somos', '/es/quienes-somos was not the result when calling pathFor with lang = es option');


        var urlFor = Blaze._globalHelpers['urlFor'];

        test.equal(urlFor('test-i18n', {}), 'http://localhost:3000/es/test-i18n', 'http://localhost:3000/es/test-i18n was not the result when calling pathFor with empty options.');

        test.equal(urlFor('test-i18n', {hash: {lang: 'it'}}), 'http://localhost:3000/it/test-i18n', 'http://localhost:3000/it/test-i18n was not the result when calling pathFor with lang = it option');

        test.equal(urlFor('about', {}), 'http://localhost:3000/es/about', 'http://localhost:3000/es/about was not the result when calling pathFor with empty options.');

        test.equal(urlFor('about', {hash: {lang: 'it'}}), 'http://localhost:3000/it/chi-siamo', 'http://localhost:3000/it/test-i18n was not the result when calling pathFor with lang = it option');

        test.equal(urlFor('about', {hash: {lang: 'es'}}), 'http://localhost:3000/es/quienes-somos', 'http://localhost:3000/it/test-i18n was not the result when calling pathFor with lang = es option');

    });


    Tinytest.add('Router i18n - test i18n template name resolution', function (test) {

        var router = initRouter();

        defaultConf(router);

        var routeAbout = router.route('about',
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

        var defaultController = routeAbout.createController({});
        defaultController.router = router;
        var itController = routeAbout.getRouteForLang('it').createController();
        itController.router = router;
        var esController = routeAbout.getRouteForLang('es').createController();
        esController.router = router;

        test.equal(defaultController.lookupTemplate(), 'About', 'Template is not "About" for default route.');

        test.equal(esController.lookupTemplate(), 'About', 'Template is not "About" for es route.');

        test.equal(itController.lookupTemplate(), 'about_it_template', 'Template is not about "about_it_template" for it route.');


    });

}

if (Meteor.isServer) {

    Tinytest.add('Router i18n - test default language prefix strategy', function (test) {

        testDefaultLanguagePrefix(test, 'server');

    });


    Tinytest.add('Router i18n - test custom routes i18n paths', function (test) {

        testCustomPath(test, 'server')

    });

}