Tinytest.add('Router i18n - test helpers', function (test) {

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
                        path: '/es/quienes-somos'
                    }
                }
            }

        });

    var pathFor = Blaze._globalHelpers['pathFor'];

    test.equal(pathFor('test-i18n', {}), '/en/test-i18n', '/test-i18n was not the result when calling pathFor with empty options (default language: en).');

    test.equal(pathFor({hash: {route: 'test-i18n'}}), '/en/test-i18n', '/test-i18n was not the result when calling pathFor with empty options (default language: en).');

    test.equal(pathFor('test-i18n', {hash: {lang: 'it'}}), '/it/test-i18n', '/it/test-i18n was not the result when calling pathFor with lang = it option');

    test.equal(pathFor('about'), '/en/about', '/en/about was not the result when calling pathFor with empty options.');

    test.equal(pathFor('about', {hash: {lang: 'it'}}), '/it/chi-siamo', '/it/chi-siamo was not the result when calling pathFor with lang = it option');

    test.equal(pathFor('about', {hash: {lang: 'es'}}), '/es/quienes-somos', '/about was not the result when calling pathFor with lang = es option');


    var urlFor = Blaze._globalHelpers['urlFor'];

    test.equal(urlFor('test-i18n', {}), 'http://localhost:3000/en/test-i18n', 'http://localhost:3000/en/test-i18n was not the result when calling pathFor with empty options.');

    test.equal(urlFor({hash: {route: 'test-i18n'}}), 'http://localhost:3000/en/test-i18n', 'http://localhost:3000/en/test-i18n was not the result when calling pathFor with empty options.');

    test.equal(urlFor('test-i18n', {hash: {lang: 'it'}}), 'http://localhost:3000/it/test-i18n', 'http://localhost:3000/it/test-i18n was not the result when calling pathFor with lang = it option');

    test.equal(urlFor('about', {}), 'http://localhost:3000/en/about', 'http://localhost:3000/en/about was not the result when calling pathFor with empty options.');

    test.equal(urlFor('about', {hash: {lang: 'it'}}), 'http://localhost:3000/it/chi-siamo', 'http://localhost:3000/it/chi-siamo was not the result when calling pathFor with lang = it option');

    test.equal(urlFor('about', {hash: {lang: 'es'}}), 'http://localhost:3000/es/quienes-somos', 'http://localhost:3000/es/quienes-somos was not the result when calling pathFor with lang = es option');

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

