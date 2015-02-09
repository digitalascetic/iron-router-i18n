initRouter = function () {

    var router = new I18NRouter({autoRender: false, autoStart: false});

    return router;

}

defaultConf = function (router) {

    router.configure({

        serverSide: true,

        i18n: {

            defaultLanguage: 'es',

            languages: ['it', 'es', 'en']

        }

    });

}
