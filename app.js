var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs-extra')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var FileStreamRotator = require('file-stream-rotator')
var accessLogStream
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Config Logging system
if (process.env.REQUEST_LOG_FILE) {
  let logDirectory = path.dirname(REQUEST_LOG_FILE)
  if ( !fs.existsSync(logDirectory) ) fs.mkdirsSync(logDirectory)
  accessLogStream = FileStreamRotator.getStream({
    filename: process.env.REQUEST_LOG_FILE,
    frequency: 'daily',
    verbose: false
  })
}

app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
  stream: accessLogStream ? accessLogStream : process.stdout
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
