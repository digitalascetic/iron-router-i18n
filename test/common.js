initRouter = function () {
    I18NConf.reset(true); //Full reset;
    I18NConf.setLanguage('en');
    return new Iron.Router({autoRender: false, autoStart: false});

};

defaultConf = function (router) {

    I18NConf.configure({

        defaultLanguage: 'en',

        languages: ['it', 'es', 'en'],

        language: 'en',

        // Avoid to persist language between tests!
        persistLanguage: false,

        autoConfLanguage: false

    });

    router.configure({

        i18n: {

            setLangCode: false,

            serverSide: true,

            deferRouteCreation: false

        }

    });

};




