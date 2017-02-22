var path = require('path');
var exphbs = require('express-handlebars');
var viewHelpers = require('./view_helpers.js');

function GovukAdminTemplate(model) {
  for (var k in model) {
    this[k] = model[k]; // needs to be recursive
  }
}

GovukAdminTemplate.prototype.environment_style = undefined;
GovukAdminTemplate.prototype.environment_label = undefined;
GovukAdminTemplate.prototype.app_title = 'Offender Management';
GovukAdminTemplate.prototype.navbar_items= [
  { label: 'My Cases', url: '/casefile' },
  { label: 'My Staff', url: '/keyworker' },
];
GovukAdminTemplate.prototype.has_navbar_content = true;
GovukAdminTemplate.prototype.current_user = { name: 'My details' };


// configures app.locals when created
function govukAdminTemplate(locals, c) {
  var l = locals.GovukAdminTemplate = {};
  l.config = {};

  l.config.app_title = c.app_title || 'GOV.UK Admin Title';
  l.config.show_flash = c.show_flash || true;
  l.config.show_signout = c.show_signout || true;
  l.config.disable_google_analytics = c.disable_google_analytics || false;

  l.create = (model) =>
    new GovukAdminTemplate(model);

  // configures res.locals on each request
  l.configure = (req, res, next) => {
    res.locals.environment_style = req.app.locals.GovukAdminTemplate.environment_style;
    res.locals.environment_label = req.app.locals.GovukAdminTemplate.environment_label;
    /*
    res.locals.app_home_path = content_for?(:app_home_path) ? yield(:app_home_path) : root_path
    res.locals.app_title = content_for?(:app_title) ? yield(:app_title) : GovukAdminTemplate.config.app_title
    res.locals.has_navbar_content = GovukAdminTemplate.config.show_signout || content_for?(:navbar_right) || content_for?(:navbar_items)
    */
    res.locals.disable_google_analytics = l.config.disable_google_analytics;

    next();
  };
}

module.exports = function(app, config) {
  govukAdminTemplate(app.locals, config || {});

  // view engine setup
  app.set('views',        path.join(__dirname, '../views'));
  app.engine('.hbs',      exphbs({
    defaultLayout: 'govuk_admin_template',
    extname: '.hbs',
    helpers: viewHelpers,
  }));
  app.set('view engine',  'hbs');

  require('./environments/' + app.get('env'))(app.locals.config);

  app.use('/', app.locals.GovukAdminTemplate.configure)
}
