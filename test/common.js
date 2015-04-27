initRouter = function () {
    I18NConf.setLanguage('en');
    I18NConf.reset()
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

        serverSide: true,

        i18n: {

            setLangCode: false

        }

    });

};




