var Handlebars = require('handlebars');
var moment = require('moment');

// helpers

const safeString = (s) => new Handlebars.SafeString(s);
const escapedExpression = (e) => Handlebars.escapeExpression(e);
const safeDateString = (datetime, format) => safeString(moment(datetime).format(format));

// public

const Helpers = {};

Helpers.href_to = (href) => safeString(escapedExpression(href));
Helpers.link_to = (label, href, className) => safeString('<a href="' + escapedExpression(href) + '" class="' + className + '">'+ label +'</a>');
Helpers.javascript_include = (src) => safeString('<script src="/' + escapedExpression(src) + '.js"></script>');
Helpers.stylesheet_link = (href) => safeString('<link href="/' + escapedExpression(href) + '.css" rel="stylesheet" media="screen">');

Helpers.sentence_date = (datetime) => safeDateString(datetime, 'MMM YY');
Helpers.casenote_date = (datetime) => safeDateString(datetime, 'MMMM Do YYYY, h:mma');
Helpers.date_input_value = (datetime) => safeDateString(datetime, 'YYYY-MM-DD HH:mm');
Helpers.profile_dob = (datetime) => safeDateString(datetime, 'DD MMM YY');

Helpers.expand_gender = (x) => {
  switch (x) {
    case 'M': return safeString('Male');
    case 'F': return safeString('Female');
    default: return safeString('Unspecified');
  }
};

Helpers.option_selected = (value, x) => safeString(x === value ? 'selected' : '');
Helpers.option_checked = (value, x) => safeString(x === value ? 'checked' : '');

module.exports = Helpers;
