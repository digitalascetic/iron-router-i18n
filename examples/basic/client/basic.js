Template.layout.events({
    'click .langMenu > li > a': function (event, template) {
        I18NConf.setLanguage(event.target.id);
        event.preventDefault();
    }
});
