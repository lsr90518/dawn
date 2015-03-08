var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var flash = require('connect-flash');
var config = require('./config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('secret key', 'iYrGXU6oHwLPYry764c9eIsBg0lbozgv');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body['_method'];
    delete req.body['_method'];
    return method;
  }
}));

app.use(cookieParser());
app.use(session({
  secret: 'iYrGXU6oHwLPYry764c9eIsBg0lbozgv',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var authFilter = require('./filter/auth')({
  allows: [
    '/login',
    '/login/callback',
    '/auth/facebook',
    '/auth/facebook/callback'
  ]
});
//app.use(authFilter);

app.use('/app', express.static(path.join(__dirname, 'app')));
app.use(express.static(path.join(__dirname, 'bower_components')));

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

// Bootstrap routes
require('./routes/routes')(app);


module.exports = app;
