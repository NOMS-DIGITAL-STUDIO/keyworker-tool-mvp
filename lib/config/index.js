// configures app.locals when created
function GovukAdminTemplate(locals, c) {
  var config = this.config = {};

  this.config.app_title = c.app_title || 'GOV.UK Admin Title';
  this.config.show_flash = c.show_flash || true;
  this.config.show_signout = c.show_signout || true;
  this.config.disable_google_analytics = c.disable_google_analytics || false;
}

GovukAdminTemplate.prototype.environment_style = undefined;
GovukAdminTemplate.prototype.environment_label = undefined;

// configures res.locals on each request
GovukAdminTemplate.configure = function (req, res, next) {
  res.locals.environment_style = req.app.locals.GovukAdminTemplate.environment_style;
  res.locals.environment_label = req.app.locals.GovukAdminTemplate.environment_label;
  /*
  res.locals.app_home_path = content_for?(:app_home_path) ? yield(:app_home_path) : root_path
  res.locals.app_title = content_for?(:app_title) ? yield(:app_title) : GovukAdminTemplate.config.app_title
  res.locals.has_navbar_content = GovukAdminTemplate.config.show_signout || content_for?(:navbar_right) || content_for?(:navbar_items)
  */
  res.locals.disable_google_analytics = req.app.locals.GovukAdminTemplate.config.disable_google_analytics;

  next();
};

module.exports = function(app, config) {
  app.locals.GovukAdminTemplate = new GovukAdminTemplate(app.locals, config || {});

  require('./environments/' + app.get('env'))(app.locals.config);

  app.use('/', GovukAdminTemplate.configure)
}
