I18NConf.configure({

    languages: ["it", "en", "es"],

    defaultLanguage: 'en',

    autoConfLanguage: true

});

Router.configure({
    layoutTemplate: 'layout'
})

Router.route('/', {name: 'home'});

// when you navigate to "/one" automatically render the template named "One".
Router.route('/one', {name: 'one'});

// when you navigate to "/two" automatically render the template named "Two".
Router.route('/two', {

    name: 'two',

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
