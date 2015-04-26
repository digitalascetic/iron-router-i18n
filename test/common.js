resetCookie = function() {
    if (Meteor.isClient) {
        document.cookie = 'martino:i18n-conf:lang' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}

initRouter = function () {
    resetCookie();
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

            defaultLanguage: 'en',

            languages: ['it', 'es', 'en'],

            setLangCode: false,

            // Avoid to persist language between tests!
            persistLanguage: false

        }

    });

};




