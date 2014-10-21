var _i18n_hooks_server = _.clone(Router._i18n.hooks.server);
var _i18n_hooks_client = _.clone(Router._i18n.hooks.client);
var _i18n_hooks = _.clone(Router._i18n.hooks);
var _i18n = _.clone(Router._i18n);

var TestRouter = {

    missingLangCodeAction: false,

    missingPath: null,

    onRouteNotFoundCalled: false,

    initRouter: function () {

        var that = this;

        Router.options = {};
        Router.routes = [];

        Router._i18n = _.clone(_i18n);
        Router._i18n.hooks = _.clone(_i18n_hooks);
        Router._i18n.hooks.server = _.clone(_i18n_hooks_server);
        Router._i18n.hooks.client = _.clone(_i18n_hooks_client);

        this.resetVar();

        Router.onRouteNotFound = function (path, options) {
            that.onRouteNotFoundCalled = true;
        };

        Router.configure({
            i18n: {
                client: {
                    missingLangCodeAction: function (path, options) {
                        that.missingPath = path;
                        that.missingLangCodeAction = true;
                    }
                }
            }

        });

    },

    resetVar: function () {
        this.onRouteNotFoundCalled = false;
        this.missingLangCodeAction = false;
        this.missingPath = null;
    }

};

/*****************************************************************************/
/* Server and Client */
/*****************************************************************************/
Tinytest.add('Router i18n - test i18n Router configuration', function (test) {

    TestRouter.initRouter();

    var clientMissingLangCodeAction = false;

    Router.configure({

        i18n: {

            serverSide: false,

            client: {
                missingLangCodeAction: function (path, options) {
                    clientMissingLangCodeAction = true;
                }
            }
        }

    });

    var reset = function () {
        TestRouter.initRouter();
        clientMissingLangCodeAction = false;
    }

    if (Meteor.isClient) {

        Router.options.i18n.missingLangCodeAction.apply(Router, ['/missingRoute', Router.options]);
        test.isTrue(clientMissingLangCodeAction, 'Client configured missingLangCodeAction was not called.');
        reset();

    }

    Router.configure({

        i18n: {

            serverSide: true,

            defaultLanguage: 'es',

            client: {
                defaultLanguage: 'en'
            },

            server: {
                defaultLanguage: 'it'
            }
        }

    });

    if (Meteor.isServer) {
        test.equal(Router.options.i18n.defaultLanguage, 'it', 'Default language for client is not "it" as overridden by configuration.');
    } else {
        test.equal(Router.options.i18n.defaultLanguage, 'en', 'Default language for client is not "it" as overridden by configuration.');

    }
    reset();
});

Tinytest.add('Router i18n - test i18n route configuration', function (test) {

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

    test.isFalse(_.isUndefined(Router.routes['about']), 'Route name "about" was not found.');
    test.equal(Router.routes['about'].options.layoutTemplate, 'base_layout', 'Base layout of route "about" is not "base_layout".');

    test.isFalse(_.isUndefined(Router.routes['about_it']), 'Route "about_it" does not exists.');
    test.equal(Router.routes['about_it'].options.layoutTemplate, 'base_layout', 'Base layout of route "about_it" is not inherited as "base_layout".');
    test.equal(Router.routes['about_it'].options.template, 'about_it_template', 'Template for route "about_it" is not overridden "about_it_template"');

    test.isFalse(_.isUndefined(Router.routes['about_es']), 'Route "about_es" does not exists.');
    test.equal(Router.routes['about_es'].options.layoutTemplate, 'es_layout', 'Base layout of route "about_es" is not overridden as "es_layout".');

});

/*****************************************************************************/
/* Client */
/*****************************************************************************/
if (Meteor.isClient) {

    Tinytest.add('Router i18n - test Router methods', function (test) {

        TestRouter.initRouter();

        Router.configure({
            i18n: {
            }
        })

        test.equal(Router.getDefaultLanguage(), 'en', 'Router default language is not "en".')

        TestRouter.initRouter();
        Router.configure({
            i18n: {
                defaultLanguage: 'es'
            }
        })
        test.equal(Router.getDefaultLanguage(), 'es', 'Router default language after changing "defaultLanguage" conf option is not "es".');

        // Testing getLanguage
        test.equal(Router.getLanguage(), 'es', 'Router language is not "es" when having defaultLanguage "es".');

        //Testing language change
        Router.setLanguage('it');
        test.equal(Router.getLanguage(), 'it', 'Router did not change language to "it"');


        // Testing custom getDefaultLanguage method
        TestRouter.initRouter();

        Router.configure({
            i18n: {
                getDefaultLanguage: function () {
                    return 'en';
                }
            }
        });

        test.equal(Router.getDefaultLanguage(), 'en', 'Router default language is not "en" after setting getDefaultLanguage method.')

    });

    Tinytest.add('Router i18n - test default language prefix strategy', function (test) {

        TestRouter.initRouter();


        var testRouteMatched = false;
        Router.route('test-i18n',
            {
                path: '/test-i18n',
                action: function () {
                    testRouteMatched = true;
                }

            }
        );

        var resetVars = function () {
            TestRouter.resetVar();
            testRouteMatched = false;
        }
        /*
         Router.dispatch('/es/test-i18n');
         test.isTrue(testRouteMatched, '/test-i18n route not matched for /es/test-i18n');
         test.equal(Router.getOrigPath(), '/es/test-i18n', 'Original path is not preserved as /es/test-i18n');
         resetVars();
         */
        Router.dispatch('/en/test-i18n');
        test.isTrue(testRouteMatched, '/test-i18n route not matched for /en/test-i18n');
        test.equal(Router.getOrigPath(), '/en/test-i18n', 'Original path is not preserved as /en/test-i18n');
        resetVars();


        Router.dispatch('/it/test-i18n');
        test.isTrue(testRouteMatched, '/test-i18n route not matched for /it/test-i18n');
        test.equal(Router.getOrigPath(), '/it/test-i18n', 'Original path is not preserved as /it/test-i18n');
        resetVars();


        // Testing missingLangCodeAction

        // Lang code "de" not in allowed languages

        Router.dispatch('/de/test-i18n');
        test.isTrue(TestRouter.onRouteNotFoundCalled, '/test-i18n route matched for /de/test while "de" not allowed language');
        test.equal(TestRouter.missingPath, '/de/test-i18n', '/test-i18n route matched for /de/test-i18n while de not allowed language');
        resetVars();


        // Lang code missing
        Router.dispatch('/test-i18n');
        test.isTrue(TestRouter.missingLangCodeAction, '/test-i18n: missingLangCodeAction not called on route without lang code');
        resetVars();


    });

    Tinytest.add('Router i18n - test custom routes i18n paths', function (test) {

        var testRouteMatchedEN = false;
        var testRouteMatchedES = false;
        var testRouteMatchedIT = false;
        var postId = null;


        var resetVars = function () {
            TestRouter.resetVar();
            testRouteMatchedEN = false;
            testRouteMatchedES = false;
            testRouteMatchedIT = false;
            postId = null;
        }

        Router.route('about',
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


        Router.route('contact',
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

        Router.route('post',
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
        Router.dispatch('/en/about');
        test.isTrue(testRouteMatchedEN, 'about route not matched for /en/about');
        test.equal(Router.getOrigPath(), '/en/about', 'Original path is not preserved as /en/about');
        resetVars();

        Router.dispatch('/it/chi-siamo');
        test.isTrue(testRouteMatchedIT, 'about_it route not matched for /it/chi-siamo');
        test.equal(Router.getOrigPath(), '/it/chi-siamo', 'Original path is not preserved as /it/chi-siamo');
        resetVars();

        Router.dispatch('/es/quienes-somos');
        test.isTrue(testRouteMatchedES, 'about_es route not matched for /es/quienes-somos');
        test.equal(Router.getOrigPath(), '/es/quienes-somos', 'Original path is not preserved as /es/quienes-somos');
        resetVars();

        Router.dispatch('/it/about');
        test.isTrue(TestRouter.onRouteNotFoundCalled, '/it/about route matched for "about" route while specific language path present');
        resetVars();


        // Test mixed prefix/custom i18n path routes
        Router.dispatch('/en/contact');
        test.isTrue(testRouteMatchedEN, 'contact route not matched for /en/contact');
        test.equal(Router.getOrigPath(), '/en/contact', 'Original path is not preserved as /en/contact');
        resetVars();

        Router.dispatch('/it/contatto');
        test.isTrue(testRouteMatchedIT, 'contact_it route not matched for /it/contatto');
        test.equal(Router.getOrigPath(), '/it/contatto', 'Original path is not preserved as /it/contatto');
        resetVars();

        Router.dispatch('/es/contact');
        test.isTrue(testRouteMatchedEN, 'about_es route not matched for /es/contact');
        test.equal(Router.getOrigPath(), '/es/contact', 'Original path is not preserved as /es/contact');
        test.equal(Router.getLanguage(), 'es', '"es" not set as language for route /es/contact');
        resetVars();


        // Test mixed custom i18n path routes with parameters
        Router.dispatch('/en/post/34');
        test.isTrue(testRouteMatchedEN, 'contact route not matched for /en/post/34');
        test.equal(Router.getOrigPath(), '/en/post/34', 'Original path is not preserved as /en/post/34');
        test.equal(postId, "34", 'Post id not identified as "34" for /en/post/34');
        resetVars();

        Router.dispatch('/it/articolo/34');
        test.isTrue(testRouteMatchedIT, 'contact route not matched for /it/articolo/34');
        test.equal(Router.getOrigPath(), '/it/articolo/34', 'Original path is not preserved as /it/articolo/34');
        test.equal(postId, "34", 'Post id not identified as "34" for /it/articolo/34');
        resetVars();

        Router.dispatch('/');
        resetVars();

    });

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

