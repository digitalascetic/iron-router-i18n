initRouter = function () {

    return new Iron.Router({autoRender: false, autoStart: false, i18n: {i18nConf: false}});

};

defaultConf = function (router) {

    router.configure({

        serverSide: true,

        i18n: {

            defaultLanguage: 'en',

            languages: ['it', 'es', 'en'],

            setLangCode: false,

            // Avoid to persist language between tests!
            persistLanguage: false

        }

    });

};

initi18nConfRouter = function () {

    return new Iron.Router({autoRender: false, autoStart: false});

};

i18nConf = function (router) {

    I18NConf.configure({

        defaultLanguage: 'en',

        languages: ['it', 'es', 'en'],

        // Avoid to persist language between tests!
        persistLanguage: false

    });

    router.configure({

        serverSide: true,

        i18n: {

            setLangCode: false

        }

    });

};



