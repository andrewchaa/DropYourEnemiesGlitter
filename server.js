var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieFlash = require('./helpers/flash');

var port = process.env.PORT || 3100

try {
  require('./config')();
} catch (exception) {
  console.log("No config, it must be in production.");
}

var cookieSecret = process.env.cookie_secret;

app.set('view engine', 'vash');
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(cookieParser(cookieSecret));
app.use(cookieFlash());

app.use('/', express.static('./public'));

var controllers = require('./controllers');
controllers(app);

var server = app.listen(port, function () {
	console.log('listening on port %s', port);
});
