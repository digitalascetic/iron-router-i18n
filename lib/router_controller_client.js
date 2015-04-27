RouteController.prototype.lookupTemplate = function () {
    return this.lookupOption('template') ||
        (this.router && this.router.toTemplateName(this.route._i18n.defaultRoute.getName()));
};