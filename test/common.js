initRouter = function () {

    return new Iron.Router({autoRender: false, autoStart: false});

};

defaultConf = function (router) {

    router.configure({

        serverSide: true,

        i18n: {

            defaultLanguage: 'en',

            languages: ['it', 'es', 'en'],

            setLangCode: false

        }

    });

};
