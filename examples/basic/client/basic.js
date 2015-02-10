Template.layout.events({
    'click .langMenu > li > a': function (event, template) {
        Router.setLanguage(event.target.id);
        event.preventDefault();
    }
});

Template.layout.helpers({
    currentLanguage: function () {
        Router.getLanguageDep().depend();
        return Router.getLanguage();
    }
});
