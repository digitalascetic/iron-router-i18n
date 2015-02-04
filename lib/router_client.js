var superDispatch = Router.dispatch;

Router.dispatch = function (url, context, done) {

    var langCode;

    if (this.options.i18n.getLangCode) {
        langCode = this.options.i18n.getLangCode.apply(this, [url, this.options]);
    }

    if (!langCode) {

        if (_.isFunction(this.options.i18n.missingLangCodeAction)) {
            if (this.options.i18n.missingLangCodeAction.apply(this, [url, this.options])) {
                return;
            }
        }

    } else {

        if (this.options.i18n.langCodeAction) {
            this.options.i18n.langCodeAction.apply(this, [url, this.options]);
        }

        if (this.options.i18n.rewritePath) {
            url = this.options.i18n.rewritePath.apply(this, [url, this.options]);
        }

    }

    superDispatch.apply(this, [url, context, done]);

};

