(function () {

    var Fiber = Npm.require('fibers');

    _.extend(Router._i18n.hooks, {

        server: {

            missingLangCodeAction: function (path, options) {
                if (options.i18n.serverSide) {
                    var self = this;
                    Fiber(function () {
                        var lang = self.getLanguage();
                        if (lang) {
                            self.stop();
                            self.response.writeHead(options.i18n.redirectCode, {"Location": Meteor.absoluteUrl() + lang + path});
                            return response.end();
                        } else {
                            console.log("Can't retrieve current language on " + this.getEnv() + ".");
                        }
                    }).run();

                }
            }

        }

    });

}());
