RouteController.prototype.lookupTemplate = function () {
    return this.lookupOption('template') ||
        (this.router && this.router.toTemplateName(this.route.getDefaultRoute().getName()));
};