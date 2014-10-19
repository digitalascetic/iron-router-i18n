(function () {

    _.extend(Router._i18n.hooks, {

        missingLangCodeAction: function (path, options) {
            if (options.i18n.serverSide) {
                var lang = this.getLanguage();
                if (lang) {
                    this.stop();
                    this.response.writeHead(options.i18n.redirectCode, {"Location": Meteor.absoluteUrl() + lang + path});
                    this.response.end();
                } else {
                    console.log("Can't retrieve current language on " + this.getEnv() + ".");
                }
            }
        }

    });

}());
