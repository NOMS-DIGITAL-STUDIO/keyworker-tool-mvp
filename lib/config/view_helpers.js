var Handlebars = require('handlebars');
var moment = require('moment');

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

Helpers.sentence_date = (datetime) =>
  new Handlebars.SafeString(moment(datetime).format('MMM YY'));

module.exports = Helpers;
