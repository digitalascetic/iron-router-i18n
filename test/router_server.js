Tinytest.add('Router i18n - test getLangCode (server)', function (test) {

    var router = initRouter();

    defaultConf(router);

    router.configure({

        i18n: {

            compulsoryLangCode: true,

            serverSide: true

        }

    });

    router.route('/test');

    router.dispatch('/en/test', null, null);

    test.equal('en', router.getLangCode(), 'Lang code is not "en"');

    router.dispatch('/es/test', null, null);

    test.equal('es', router.getLangCode(), 'Lang code is not "es"');

});