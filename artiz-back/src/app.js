const express    = require('express')
const app        = express()
const bodyParser = require('body-parser')
const logger = require('morgan')
const routes = require('./server/routes')
const cors = require('cors')

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const port = process.env.PORT || 3000

app.use('/api', routes);

app.use(function(req, res, next) {
   // res.header("Access-Control-Allow-Origin", "*");
   // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
 });

module.exports = app
