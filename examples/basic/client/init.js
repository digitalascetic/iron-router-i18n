Router.configure({

    layoutTemplate: 'layout',

    i18n: {

        serverSide: true,

        languages: ["it", "en", "es"],

        defaultLanguage: 'en',

        _language: null,

        getLanguage: function () {
            if (this._language) {
                return this._language;
            } else {
                return 'en';
            }
        },

        setLanguage: function (lang) {
            this._language = lang;
        }

    }

});

Router.route('/', function () {
    // render the Home template with a custom data context
    this.render('Home', {data: {title: 'My Title'}});
});

// when you navigate to "/one" automatically render the template named "One".
Router.route('one', {

    path: '/one'
    /*
     i18n: {

     languages: {

     it: {
     template: 'Due'
     },

     es: {
     template: 'Dos'
     }

     }
     }
     */
});

// when you navigate to "/two" automatically render the template named "Two".
Router.route('two', {

    path: '/two',

    i18n: {

        languages: {

            it: {
                path: '/due'
            },

            es: {
                path: '/dos'
            }

        }
    }

});
