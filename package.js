Npm.depends({locale: "0.0.20"});

Package.describe({
    summary: 'Iron Router support for i18n',
    git: "https://github.com/yoolab/iron-router-i18n.git",
    name: "martino:iron-router-i18n",
    version: '0.5.8'
});

Package.onUse(function (api) {

    api.versionsFrom('1.0');

    api.use('tracker@1.0.5', ['client', 'server']);
    api.use('underscore@1.0.2', ['client', 'server']);

    api.use("iron:router@1.0.0", ['client', 'server']);

    // Weak dependency on i18n-conf, see #46
    api.use("martino:i18n-conf@0.3.1", ['client', 'server'], {weak: true});

    // for helpers
    api.use('blaze', 'client');

    api.addFiles('lib/router.js', ['client', 'server']);
    api.addFiles('lib/router_client.js', ['client']);
    api.addFiles('lib/router_server.js', ['server']);
    api.addFiles('lib/route.js', ['client', 'server']);
    api.addFiles('lib/router_controller_client.js', ['client']);
    api.addFiles('lib/helpers.js', ['client']);
    api.addFiles('lib/init.js', ['client', 'server']);

    api.export('Router', ['client', 'server']);

});

Package.onTest(function (api) {

    api.use('tracker@1.0.5', ['client', 'server']);
    api.use('underscore@1.0.2', ['client', 'server']);

    api.use("martino:i18n-conf@0.3.1", ['client', 'server'], {weak: false});

    api.use("iron:router@1.0.0", ['client', 'server']);

    api.use("martino:iron-router-i18n@0.5.8", ['client', 'server']);
    api.use('tinytest', ['client', 'server']);
    api.use('test-helpers', ['client', 'server']);

    api.addFiles('test/common.js', ['client', 'server']);
    api.addFiles('test/router.js', ['client', 'server']);
    api.addFiles('test/router_client.js', ['client']);

});
