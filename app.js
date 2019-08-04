const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const port = process.env.PORT || 3000;

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use('/assets', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use('/', function (req, res, next) {
	console.log('Request Url:' + req.url);
	next();
});

app.get('/', function(req, res) {
	res.render('home');
});

app.post('/thankyou', urlencodedParser, function(req, res) {
	res.send('<h1>Thank You!</h1>');
	console.log('URL to be checked', req.body.url, req.body.username, req.body.password);
});

app.listen(port);