I18NConf.configure({

    languages: ["it", "en", "es"],

    defaultLanguage: 'en',

    autoConfLanguage: true

});

I18NConf.onLanguageChange(function(oldLang, newLang) {

    console.log("New lang: " + newLang);

});

Router.configure({

    layoutTemplate: 'layout',

    i18n: {

        serverSide: true,

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
}, { name: 'home'});

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
