I18NRouter = new I18NRouter;
delete Package['iron:router'].Router;
Package['iron:router'].Router = I18NRouter;
Router = I18NRouter;