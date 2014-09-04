/*****************************************************************************/
/* Client */
/*****************************************************************************/
if (Meteor.isClient) {

    Tinytest.add('Router i18n - test dispatch', function (test) {


        var router = Router;

        var testRouteMatched = false;
        Router.route('test-i18n',
            {
                path: '/test-i18n',
                action: function () {
                    testRouteMatched = true;
                }

            }
        );

        var onRouteNotFoundCalled = false;
        router.onRouteNotFound = function (path, options) {
            onRouteNotFoundCalled = true;
        };

        var missingLangCodeAction = false;
        var missingLangCodeActionOrig = Router.options.i18n.missingLangCodeAction;
        var missingPath = null;
        Router.options.i18n.missingLangCodeAction = function(path, options) {
            missingPath = path;
            missingLangCodeAction = true;
            missingLangCodeActionOrig.apply(Router, [path, options]);
        };

        var resetVar = function() {
            testRouteMatched = false;
            onRouteNotFoundCalled = false;
            missingLangCodeAction = false;
            missingPath = null;
            Router.options.i18n.setLanguage('en');
        }

        router.dispatch('/es/test-i18n');
        test.isTrue(testRouteMatched, '/test-i18n route not matched for /es/test-i18n');
        test.equal('/es/test-i18n', '/es/test-i18n', 'Original path is not preserved as /es/test-i18n');
        resetVar();

        router.dispatch('/en/test-i18n');
        test.isTrue(testRouteMatched, '/test-i18n route not matched for /en/test-i18n');
        test.equal(Router.getOrigPath(), '/en/test-i18n', 'Original path is not preserved as /en/test-i18n');
        resetVar();


        router.dispatch('/it/test-i18n');
        test.isTrue(testRouteMatched, '/test-i18n route not matched for /it/test-i18n');
        test.equal(Router.getOrigPath(), '/it/test-i18n', 'Original path is not preserved as /it/test-i18n');
        resetVar();


        // Testing missingLangCodeAction

        // Lang code not in allowed languages
        router.dispatch('/de/test-i18n');
        test.isTrue(onRouteNotFoundCalled, '/test-i18n route matched for /de/test while de not allowed language');
        test.equal(missingPath, '/de/test-i18n', '/test-i18n route matched for /de/test-i18n while de not allowed language');
        resetVar();

        // Lang code missing
        router.dispatch('/test-i18n');
        test.isTrue(missingLangCodeAction, '/test-i18n: missingLangCodeAction not called on route without lang code');
        resetVar();


    });

}

