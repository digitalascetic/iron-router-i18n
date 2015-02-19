/*****************************************************************************/
/* Server and Client */
/*****************************************************************************/


Tinytest.add('Router i18n - test i18n Router configuration', function (test) {

    var router = initRouter();

    defaultConf(router);

    router.configure({
        i18n: {
            defaultLanguage: 'es'
        }
    })

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

            compulsoryLangCode: true,

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
                        name: 'about_it',
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

    test.isFalse(_.isUndefined(router.routes['about']), 'Route name "en.about" was not found.');
    test.equal(router.routes['about'].options.layoutTemplate, 'base_layout', 'Base layout of route "about" is not "base_layout".');

    test.isFalse(_.isUndefined(router.routes['about_it']), 'Route "about_it" does not exists.');
    test.equal(router.routes['about_it'].options.layoutTemplate, 'base_layout', 'Base layout of route "about_it" is not inherited as "base_layout".');
    test.equal(router.routes['about_it'].options.template, 'about_it_template', 'Template for route "about_it" is not overridden "about_it_template"');

    test.isFalse(_.isUndefined(router.routes['es.quienes-somos']), 'Route "es.quienes-somos" does not exists.');
    test.equal(router.routes['es.quienes-somos'].options.layoutTemplate, 'es_layout', 'Base layout of route "es.quienes-somos" is not overridden as "es_layout".');

});


Tinytest.add('Router i18n - test i18n route configuration (new)', function (test) {

    var router = initRouter();

    defaultConf(router);

    router.route('/test-i18n');

    router.route('/about',
        {

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

    test.isFalse(_.isUndefined(router.routes['en.about']), 'Route name "en.about" was not found.');
    test.equal(router.routes['en.about'].options.layoutTemplate, 'base_layout', 'Base layout of route "about" is not "base_layout".');

    test.isFalse(_.isUndefined(router.routes['it.chi-siamo']), 'Route "chi-siamo" does not exists.');
    test.equal(router.routes['it.chi-siamo'].options.layoutTemplate, 'base_layout', 'Base layout of route "chi-siamo" is not inherited as "base_layout".');
    test.equal(router.routes['it.chi-siamo'].options.template, 'about_it_template', 'Template for route "chi-siamo" is not overridden "about_it_template"');

    test.isFalse(_.isUndefined(router.routes['es.quienes-somos']), 'Route "quienes-somos" does not exists.');
    test.equal(router.routes['es.quienes-somos'].options.layoutTemplate, 'es_layout', 'Base layout of route "quienes-somos" is not overridden as "es_layout".');

});


function testDefaultLanguagePrefix(test, env) {

    var router = initRouter();

    defaultConf(router);

    var missingLangCodeAction = false;

    router.configure({
        i18n: {

            compulsoryLangCode: true,

            missingLangCodeAction: function () {
                missingLangCodeAction = true;
            }
        }
    });

    var testRouteMatched = false;

    var resetRouter = function () {
        testRouteMatched = false;
    }

    router.route('/test-i18n',
        {
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
    test.isTrue(testRouteMatched, '"test-i18n" route not matched for /es/test-i18n');
    resetRouter();

    req = {url: '/en/test-i18n'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"test-i18n" route not matched for /test-i18n');
    resetRouter();

    req = {url: '/it/test-i18n'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"test-i18n" route not matched for /it/test-i18n');
    resetRouter();

    // Lang code missing
    req = {url: '/test-i18n'};
    router(req, res, next);
    test.isTrue(missingLangCodeAction, '"test-i18n": missingLangCodeAction not called on route without lang code');

}


function testCustomPath(test, env) {

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

    router.route('/about',
        {

            action: function () {
                testRouteMatchedEN = true;
            },

            i18n: {
                languages: {
                    it: {
                        path: '/it/chi-siamo',
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


    router.route('/contact',
        {

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

    router.route('/post/:_id',
        {

            action: function () {
                testRouteMatchedEN = true;
                postId = this.params._id;
            },

            i18n: {
                languages: {
                    it: {
                        path: '/it/articolo/:_id',
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
    test.isTrue(testRouteMatchedEN, 'en.about route not matched for /en/about');
    resetVars();

    var req = {url: '/it/chi-siamo'};
    router(req, res, next);
    test.isTrue(testRouteMatchedIT, 'it.chi-siamo route not matched for /it/chi-siamo');
    resetVars();

    var req = {url: '/es/quienes-somos'};
    router(req, res, next);
    test.isTrue(testRouteMatchedES, 'es.quienes-somos route not matched for /es/quienes-somos');
    resetVars();

    /*
     router.dispatch('/it/about');
     test.isTrue(TestRouter.onRouteNotFoundCalled, '/it/about route matched for "about" route while specific language path present');
     resetVars();
     */

    // Test mixed prefix/custom i18n path routes
    var req = {url: '/en/contact'};
    router(req, res, next);
    test.isTrue(testRouteMatchedEN, 'en contact route not matched for /contact');
    resetVars();

    var req = {url: '/it/contatto'};
    router(req, res, next);
    test.isTrue(testRouteMatchedIT, 'it route not matched for /contatto');
    resetVars();

    var req = {url: '/es/contact'};
    router(req, res, next);
    test.isTrue(testRouteMatchedEN, 'es route not matched for /es/contact');
    test.equal(router.getLanguage(), 'es', '"es" not set as language for route /es/contact');
    resetVars();


    // Test mixed custom i18n path routes with parameters

    var req = {url: '/en/post/34'};
    router(req, res, next);
    test.isTrue(testRouteMatchedEN, 'contact route not matched for /en/post/34');
    test.equal(postId, "34", 'Post id not identified as "34" for /en/post/34');
    resetVars();

    var req = {url: '/it/articolo/34'};
    router(req, res, next);
    test.isTrue(testRouteMatchedIT, 'contact route not matched for /it/articolo/34');
    test.equal(postId, "34", 'Post id not identified as "34" for /it/articolo/34');
    resetVars();


}


function testLangVaryingConfiguration(test, env) {

    var router = initRouter();

    defaultConf(router);

    var testRouteMatched = false;
    var differentAction = false;

    var resetRouter = function () {
        testRouteMatched = false;
        differentAction = false;
    }

    router.route('/test-i18n',
        {
            action: function () {
                testRouteMatched = true;
            },

            i18n: {
                languages: {
                    it: {
                        action: function () {
                            differentAction = true;
                        }
                    }
                }
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
    test.isTrue(testRouteMatched, '"test-i18n" route not matched for /es/test-i18n');
    test.isFalse(differentAction, '"/it/test-i18n" route matched for /es/test-i18n');
    resetRouter();

    req = {url: '/en/test-i18n'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"test-i18n" route not matched for /en/test-i18n');
    test.isFalse(differentAction, '"/it/test-i18n" route matched for /en/test-i18n');
    resetRouter();

    req = {url: '/it/test-i18n'};
    router(req, res, next);
    test.isFalse(testRouteMatched, '"test-i18n" route matched for /it/test-i18n');
    test.isTrue(differentAction, 'it/test-i18n route not matched for /it/test-i18n');
    resetRouter();

}

function testRootRoute(test, env) {

    var router = initRouter();

    defaultConf(router);

    var testRouteMatched = false;

    var resetRouter = function () {
        testRouteMatched = false;
    }

    router.route('/',
        {
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

    var req = {url: '/es'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"es" route not matched for /es');
    resetRouter();

    req = {url: '/en'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"en" route not matched for /en');
    resetRouter();

    req = {url: '/it'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"it" route not matched for /it');
    resetRouter();

}

function testEdgeCases(test, env) {

    var router = initRouter();

    defaultConf(router);

    var testRouteMatched = false;

    var resetRouter = function () {
        testRouteMatched = false;
    }

    // Strange case in which the route is configured both with path option and '/login' path name
    router.route('/login',
        {

            name: 'login',
            path: '/login',
            action: function () {
                testRouteMatched = true;
            },

            where: env

        }
    );


    // Test legacy map configuration
    router.map(function () {
            this.route('/routemap',
                {
                    action: function () {
                        testRouteMatched = true;
                    },

                    where: env
                });
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

    var req = {url: '/en/login'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"login" route not matched for /en/login');
    resetRouter();

    var req = {url: '/en/routemap'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"routemap" route not matched for /en/routemap');
    resetRouter();

    var req = {url: '/it/routemap'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"routemap" route not matched for /it/routemap');
    resetRouter();

    var req = {url: '/es/routemap'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"routemap" route not matched for /es/routemap');


}


function testRouteWithFN(test, env) {

    var router = initRouter();

    defaultConf(router);

    var testRouteMatched = false;
    var testRouteMatchedIT = false;

    var resetRouter = function () {
        testRouteMatched = false;
        testRouteMatchedIT = false;
    }

    router.route('/test', function () {
        testRouteMatched = true;
    }, {

        i18n: {
            languages: {
                it: {
                    action: function () {
                        testRouteMatchedIT = true;
                    }
                }
            }
        },

        where: env

    })


    var res = {
        setHeader: function () {
        },
        end: function () {
        }
    };
    var next = function () {
    };

    var req = {url: '/es/test'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"es.test" route not matched for /es/test');
    test.isFalse(testRouteMatchedIT, '"es.test" route not matched for /es/test');
    resetRouter();

    req = {url: '/en/test'};
    router(req, res, next);
    test.isTrue(testRouteMatched, '"en.test" route not matched for /en/test');
    test.isFalse(testRouteMatchedIT, '"en.test" route not matched for /en/test');
    resetRouter();

    req = {url: '/it/test'};
    router(req, res, next);
    test.isTrue(testRouteMatchedIT, '"it.test" route not matched for /it/test');

}


if (Meteor.isClient) {

    Tinytest.add('Router i18n - test default language prefix strategy', function (test) {

        testDefaultLanguagePrefix(test, 'client');

    });


    Tinytest.add('Router i18n - test custom routes i18n paths', function (test) {

        testCustomPath(test, 'client');

    });

    Tinytest.add('Router i18n - test lang varying configuration', function (test) {

        testLangVaryingConfiguration(test, 'client');

    });

    Tinytest.add('Router i18n - test root route', function (test) {

        testRootRoute(test, 'client');

    });

    Tinytest.add('Router i18n - test route with fn', function (test) {

        testRouteWithFN(test, 'client');

    });

    Tinytest.add('Router i18n - test edge cases', function (test) {

        testEdgeCases(test, 'client');

    });


}


if (Meteor.isServer) {

    Tinytest.add('Router i18n - test default language prefix strategy', function (test) {

        testDefaultLanguagePrefix(test, 'server');

    });


    Tinytest.add('Router i18n - test custom routes i18n paths', function (test) {

        testCustomPath(test, 'server');

    });

    Tinytest.add('Router i18n - test lang varying configuration', function (test) {

        testLangVaryingConfiguration(test, 'server');

    });

    Tinytest.add('Router i18n - test root route', function (test) {

        testRootRoute(test, 'server');

    });

    Tinytest.add('Router i18n - test route with fn', function (test) {

        testRouteWithFN(test, 'server');

    });

    Tinytest.add('Router i18n - test edge cases', function (test) {

        testEdgeCases(test, 'server');

    });

}