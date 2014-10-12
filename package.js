Package.describe({
    summary: 'Iron router support for i18n routing prefix',
    git: "https://github.com/yoolab/iron-router-i18n.git",
    name: "martino:iron-router-i18n",
    version: '0.3.0'
});

Package.on_use(function (api) {

    api.versionsFrom("METEOR@0.9.0");

    api.use('reactive-dict', ['client', 'server']);
    api.use('deps', ['client', 'server']);
    api.use('underscore', ['client', 'server']);

    api.use("iron:router@0.9.1", ['client', 'server']);

    // for helpers
    api.use('ui', 'client');

    api.add_files('lib/router.js', ['client', 'server']);
    api.add_files('lib/route.js', ['client', 'server']);
    api.add_files('lib/client/ui/helpers.js', ['client']);

    api.export('Router', ['client', 'server']);

});

Package.on_test(function (api) {

    api.use('iron:router', ['client', 'server']);
    api.use("martino:iron-router-i18n", ['client', 'server']);
    api.use('tinytest', ['client', 'server']);
    api.use('test-helpers', ['client', 'server']);
    api.use('reactive-dict', ['client', 'server']);

    api.add_files('test/init.js', ['client', 'server']);
    api.add_files('test/router.js', ['client', 'server']);

});
