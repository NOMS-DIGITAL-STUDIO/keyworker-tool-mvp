var Handlebars = require('handlebars');

const Helpers = {};

Helpers.link_to = (label, href, className) =>
  new Handlebars.SafeString('<a href="' + Handlebars.escapeExpression(href) + '" class="' + className + '">'+ label +'</a>');

Helpers.href_to = (href) =>
  new Handlebars.SafeString(Handlebars.escapeExpression(href));

Helpers.javascript_include = (src) =>
  new Handlebars.SafeString('<script src="/' + Handlebars.escapeExpression(src) + '.js"></script>');

Helpers.stylesheet_link = (href) =>
  new Handlebars.SafeString('<link href="/' + Handlebars.escapeExpression(href) + '.css" rel="stylesheet" media="screen">');
  // new Handlebars.SafeString('');

module.exports = Helpers;
