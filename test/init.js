Router.configure({

    i18n: {

        defaultLanguage: 'en',

        languages: ['it', 'es', 'en'],

        getLanguage: function () {
            return Router.options.i18n.language;
        },

        setLanguage: function (lang) {
            Router.options.i18n.language = lang;
        }

    }
});
