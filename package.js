Package.describe({
    summary: 'Iron router support for i18n routing prefix',
    version: '0.1'
});

Package.on_use(function (api) {

    api.use('reactive-dict', ['client', 'server']);
    api.use('deps', ['client', 'server']);
    api.use('underscore', ['client', 'server']);
    api.use('iron-router', ['client', 'server']);


    api.add_files('lib/router.js', ['client', 'server']);

    api.export('Router', ['client', 'server']);

});

Package.on_test(function (api) {

    api.use('iron-router', ['client', 'server']);
    api.use('iron-router-i18n', ['client', 'server']);
    api.use('tinytest', ['client', 'server']);
    api.use('test-helpers', ['client', 'server']);
    api.use('reactive-dict', ['client', 'server']);


});
