Tinytest.add('Router i18n - test helpers', function (test) {

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

            i18n: {
                languages: {
                    it: {
                        path: '/chi-siamo'
                    },
                    es: {
                        path: '/es/quienes-somos'
                    }
                }
            }

        });

    var pathFor = Blaze._globalHelpers['pathFor'];

    test.equal(pathFor('test-i18n', {hash: {router: router}}), '/en/test-i18n', '/test-i18n was not the result when calling pathFor with empty options (default language: en).');

    test.equal(pathFor({
        hash: {
            route: 'test-i18n',
            router: router
        }
    }), '/en/test-i18n', '/test-i18n was not the result when calling pathFor with empty options (default language: en).');

    test.equal(pathFor('test-i18n', {
        hash: {
            lang: 'it',
            router: router
        }
    }), '/it/test-i18n', '/it/test-i18n was not the result when calling pathFor with lang = it option');

    test.equal(pathFor('about', {hash: {router: router}}), '/en/about', '/en/about was not the result when calling pathFor with empty options.');

    test.equal(pathFor('about', {
        hash: {
            lang: 'it',
            router: router
        }
    }), '/it/chi-siamo', '/it/chi-siamo was not the result when calling pathFor with lang = it option');

    test.equal(pathFor('about', {
        hash: {
            lang: 'es',
            router: router
        }
    }), '/es/quienes-somos', '/about was not the result when calling pathFor with lang = es option');


    var urlFor = Blaze._globalHelpers['urlFor'];

    test.equal(urlFor('test-i18n', {hash: {router: router}}), 'http://localhost:3000/en/test-i18n', 'http://localhost:3000/en/test-i18n was not the result when calling pathFor with empty options.');

    test.equal(urlFor({
        hash: {
            route: 'test-i18n',
            router: router
        }
    }), 'http://localhost:3000/en/test-i18n', 'http://localhost:3000/en/test-i18n was not the result when calling urlFor with empty options.');

    test.equal(urlFor('test-i18n', {
        hash: {
            lang: 'it',
            router: router
        }
    }), 'http://localhost:3000/it/test-i18n', 'http://localhost:3000/it/test-i18n was not the result when calling pathFor with lang = it option');

    test.equal(urlFor('about', {hash: {router: router}}), 'http://localhost:3000/en/about', 'http://localhost:3000/en/about was not the result when calling pathFor with empty options.');

    test.equal(urlFor('about', {
        hash: {
            lang: 'it',
            router: router
        }
    }), 'http://localhost:3000/it/chi-siamo', 'http://localhost:3000/it/chi-siamo was not the result when calling pathFor with lang = it option');

    test.equal(urlFor('about', {
        hash: {
            lang: 'es',
            router: router
        }
    }), 'http://localhost:3000/es/quienes-somos', 'http://localhost:3000/es/quienes-somos was not the result when calling pathFor with lang = es option');

    // origRoute

    test.equal(pathFor('test-i18n', {
        hash: {
            origRoute: true,
            router: router
        }
    }), '/test-i18n', '/test-i18n was not the result when calling pathFor with empty options (default language: en).');

    test.equal(urlFor('test-i18n', {
        hash: {
            origRoute: true,
            router: router
        }
    }), 'http://localhost:3000/test-i18n', 'http://localhost:3000/en/test-i18n was not the result when calling pathFor with empty options.');


});


Tinytest.add('i18n-conf - test helpers reactivity', function (test) {

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

            i18n: {
                languages: {
                    it: {
                        path: '/chi-siamo'
                    },
                    es: {
                        path: '/es/quienes-somos'
                    }
                }
            }

        });

    var pathFor = Blaze._globalHelpers['pathFor'];

    I18NConf.setLanguage('it');
    test.equal(pathFor('test-i18n', {hash: {router: router}}), '/it/test-i18n', '/it/test-i18n was not the result when calling pathFor with empty options and language = it.');

    var runCount = 0;

    // Test helper reactivity
    Tracker.autorun(function () {

        var path = pathFor('test-i18n', {hash: {router: router}});
        var currentComputation = Tracker.currentComputation;

        if (!currentComputation.firstRun) {
            runCount++;
            test.equal(path, '/es/test-i18n', 'Current path is not /es/test-i18n even if language changed to es.');
            currentComputation.stop();
        }
    });

    I18NConf.setLanguage('es');
    Tracker.flush();
    test.equal(runCount, 1);

    runCount = 0;

    var urlFor = Blaze._globalHelpers['urlFor'];


    // Test helper reactivity
    Tracker.autorun(function () {

        var url = urlFor('test-i18n', {hash: {router: router}});
        var currentComputation = Tracker.currentComputation;

        if (!currentComputation.firstRun) {
            runCount++;
            test.equal(url, 'http://localhost:3000/en/test-i18n', 'Current path is not /es/test-i18n even if language changed to en.');
            currentComputation.stop();
        }
    });

    I18NConf.setLanguage('en');
    Tracker.flush();
    test.equal(runCount, 1);

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


Tinytest.add('Router i18n - test i18n template name resolution with exclude', function (test) {

    var router = initRouter();

    defaultConf(router);

    var routeExcluded = router.route('/excluded',
        {
            i18n: {
                exclude: true
            }
        });

    var defaultController = routeExcluded.createController({});
    defaultController.router = router;

    test.equal(defaultController.lookupTemplate(), 'Excluded', 'Template is not "Exclude_template" for default route.');


});



