Package.describe({
    summary: 'Iron Router support for i18n',
    git: "https://github.com/yoolab/iron-router-i18n.git",
    name: "martino:iron-router-i18n",
    version: '0.5.0'
});

Package.on_use(function (api) {

    api.versionsFrom("METEOR@1.0");

    api.use('reactive-dict@1.0.5', ['client', 'server']);
    api.use('tracker@1.0.5', ['client', 'server']);
    api.use('underscore@1.0.2', ['client', 'server']);

    api.use("iron:router@1.0.0", ['client', 'server']);

    // for helpers
    api.use('blaze', 'client');

    Npm.depends({locale: "0.0.20"});

    api.add_files('lib/router.js', ['client', 'server']);
    api.add_files('lib/router_client.js', ['client']);
    api.add_files('lib/router_server.js', ['server']);
    api.add_files('lib/route.js', ['client', 'server']);
    api.add_files('lib/router_controller_client.js', ['client']);
    api.add_files('lib/global.js', ['client', 'server']);
    api.add_files('lib/helpers.js', ['client']);

    api.export('Router', ['client', 'server']);
    api.export('I18NRouter', ['client', 'server']);

});

Package.on_test(function (api) {

    api.use('reactive-dict@1.0.5', ['client', 'server']);
    api.use('tracker@1.0.5', ['client', 'server']);
    api.use('underscore@1.0.2', ['client', 'server']);

    api.use("iron:router@1.0.0", ['client', 'server']);
    api.use("martino:iron-router-i18n@0.5.0", ['client', 'server']);
    api.use('tinytest', ['client', 'server']);
    api.use('test-helpers', ['client', 'server']);

    api.add_files('test/router.js', ['client', 'server']);

});
