var createError = require('http-errors')
var express = require('express')
var mongoose = require('mongoose')
var path = require('path')
cookieParser = require('cookie-parser')
var logger = require('morgan')
var cors = require('cors')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var config = require('./config/mongodb.json')
var TokenModel = require('./models/TokenModel')
const res = require('express/lib/response')

var app = express()

// Mockup Data
var tokenData =
  'GWXkqmxqWQMHX7PjmX2qDw6yESrDjnh8ogd7wrx2skiN EFZH16wJ3xtE7caYDC87ojaVpLGofaaHTq3j9B8ADMfF FEaRD6P2MrRfZPh1W1CMKDyndhFnQLKzXtb9kLNy3Tgs'

// DB connection
var mongoDB =
  'mongodb://' + config.database.host + '/' + config.database.database

mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    // don't show the log when it is test
    if (process.env.NODE_ENV !== 'test') {
      console.log('Connected to %s', mongoDB)
      console.log('MongoDB is connected ... \n')

      for (var i = 0; i < tokenData.split(' ').length; i++) {
        var savedata = new TokenModel({
          address: tokenData.split(' ')[i],
        })
        savedata.save((data) => {
          console.log(data)
        })
      }
    }
  })
  .catch((err) => {
    console.log('App starting error'.err)
    process.exit(1)
  })

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
