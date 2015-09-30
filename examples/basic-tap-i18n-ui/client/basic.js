TAPi18n._afterUILanguageChange = function() {
  console.log("TAPi18n._afterUILanguageChange");  
  I18NConf.setLanguage(TAPi18n.getLanguage());
};