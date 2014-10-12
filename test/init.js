
Router.configure({

    i18n: {

        language: 'en',

        languages: ['it', 'es', 'en'],

        getLanguage: function () {
            return Router.options.i18n.language;
        },

        setLanguage: function (lang) {
            Router.options.i18n.language = lang;
        },

        getDefaultLanguage: function() {
            'en';
        }

    }
});

Router.options.i18n.setLanguage('en');
