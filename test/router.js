TestRouter = {

    missingLangCodeAction: false,

    missingLangCodeActionOrig: Router.options.i18n.missingLangCodeAction,

    missingPath: null,

    onRouteNotFoundCalled: false,


    initRouter: function () {

        var testRouter = this;

        Router.onRouteNotFound = function (path, options) {
            testRouter.onRouteNotFoundCalled = true;
        };


        Router.options.i18n.missingLangCodeAction = function (path, options) {
            testRouter.missingPath = path;
            testRouter.missingLangCodeAction = true;
            testRouter.missingLangCodeActionOrig.apply(Router, [path, options]);
        };

    },

    resetVar: function () {
        this.onRouteNotFoundCalled = false;
        this.missingLangCodeAction = false;
        this.missingPath = null;
        Router.options.i18n.setLanguage('en');
    }

}
;


/*****************************************************************************/
/* Client */
/*****************************************************************************/
if (Meteor.isClient) {

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

        var resetVars = function() {
            TestRouter.resetVar();
            testRouteMatched = false;
        }

        Router.dispatch('/es/test-i18n');
        test.isTrue(testRouteMatched, '/test-i18n route not matched for /es/test-i18n');
        test.equal(Router.getOrigPath(), '/es/test-i18n', 'Original path is not preserved as /es/test-i18n');
        resetVars();

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


        var resetVars = function() {
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

    });

}

