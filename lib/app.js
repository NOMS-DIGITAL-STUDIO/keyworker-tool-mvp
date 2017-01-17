var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var configure = require('./config');

var app = express();

var inDev = app.get('env') === 'development';
var includeErrorDetails = true || inDev;
var staticCacheMaxAge = inDev ? 0 : 1000 * 60 * 60 * 24 * 30;
var defaultStaticOptions = { index: false, maxAge: staticCacheMaxAge };

configure(app);

//app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(sassMiddleware({
  src: path.join(__dirname, './assets'),
  dest: path.join(__dirname, './.tmp'),
  debug: true,              // based on environment variables
  outputStyle: 'expanded', // 'compressed', // based on environment variables
  prefix: '/styles'
}));

// public and views come form platform.basic package
app.use(express.static(path.join(__dirname, 'assets'), defaultStaticOptions));

app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;

  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  res.render('error', { message: err.toString(), error: includeErrorDetails ? err : {} });
});

module.exports = app;
